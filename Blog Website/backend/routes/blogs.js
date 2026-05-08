import express from "express";
import multer from "multer";
import { db } from "../config/firebase.js";
import cloudinary from "../config/cloudinary.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

function uploadToCloudinary(buffer, folder = "blog-images") {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// GET /api/blogs
router.get("/", async (_req, res) => {
  try {
    const snapshot = await db.ref("blogs/").once("value");
    const data = snapshot.val();

    if (!data) return res.json({ success: true, blogs: [] });

    const blogs = Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    res.json({ success: true, blogs });
  } catch (error) {
    console.error("GET /blogs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blogs" });
  }
});

// POST /api/blogs
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, text } = req.body;
    const file = req.file;

    if (!title?.trim())
      return res.status(400).json({ success: false, message: "Title is required" });
    if (!text?.trim())
      return res.status(400).json({ success: false, message: "Blog text is required" });

    // Image is optional
    let imageURL = null;
    let imagePublicId = null;
    if (file) {
      const result = await uploadToCloudinary(file.buffer);
      imageURL = result.secure_url;
      imagePublicId = result.public_id;
    }

    const newPostRef = db.ref("blogs/").push();
    await newPostRef.set({
      title: title.trim(),
      text: text.trim(),
      imageURL,
      imagePublicId,
      createdAt: Date.now(),
    });

    res.status(201).json({
      success: true,
      message: "Blog posted successfully!",
      blog: {
        id: newPostRef.key,
        title: title.trim(),
        text: text.trim(),
        imageURL,
        createdAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("POST /blogs error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create blog" });
  }
});

// DELETE /api/blogs/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const snapshot = await db.ref(`blogs/${id}`).once("value");
    const post = snapshot.val();

    if (!post)
      return res.status(404).json({ success: false, message: "Blog not found" });

    await db.ref(`blogs/${id}`).remove();

    if (post.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(post.imagePublicId);
      } catch (_) {}
    }

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("DELETE /blogs/:id error:", error);
    res.status(500).json({ success: false, message: "Failed to delete blog" });
  }
});

export default router;
