import { useState, useRef, useCallback } from "react";

export default function CreatePost({ onCreate }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const inputRef = useRef();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  });

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const removeImage = (e) => {
    e.stopPropagation();
    setImage(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!text.trim()) newErrors.text = "Post content is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("text", text);
      if (image) fd.append("image", image);
      await onCreate(fd);
      showToast("Post published!");
      setTitle("");
      setText("");
      setImage(null);
      setPreview(null);
      setErrors({});
    } catch (err) {
      showToast(err.message || "Upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative z-10 max-w-2xl mx-auto px-4 mb-14">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-up
            ${toast.type === "error" ? "bg-rust text-white" : "bg-sage text-white"}`}
        >
          {toast.msg}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm border border-mist rounded-2xl p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-ink mb-5">Write a Post</h2>

        {/* Title input */}
        <div className="mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: "" })); }}
            placeholder="Post title *"
            maxLength={100}
            className={`w-full bg-parchment border rounded-xl px-4 py-3 text-ink text-sm font-medium
              placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-amber/40
              transition
              ${errors.title ? "border-rust/60 focus:border-rust" : "border-mist focus:border-amber"}`}
          />
          <div className="flex justify-between mt-1 px-1">
            {errors.title
              ? <p className="text-xs text-rust">{errors.title}</p>
              : <span />
            }
            <p className="text-xs text-warm-gray/50">{title.length}/100</p>
          </div>
        </div>

        {/* Body textarea */}
        <div className="mb-3">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setErrors((p) => ({ ...p, text: "" })); }}
            placeholder="What's on your mind today? *"
            rows={4}
            className={`w-full bg-parchment border rounded-xl px-4 py-3 text-ink text-sm
              placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-amber/40
              resize-none transition
              ${errors.text ? "border-rust/60 focus:border-rust" : "border-mist focus:border-amber"}`}
          />
          {errors.text && <p className="text-xs text-rust mt-1 px-1">{errors.text}</p>}
        </div>

        {/* Drop Zone — optional */}
        <div
          className={`drop-zone border-2 border-dashed rounded-xl overflow-hidden cursor-pointer
            ${dragging ? "dragging border-amber bg-amber/5" : "border-mist hover:border-amber/50"}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative group">
              <img src={preview} alt="Preview" className="w-full max-h-52 object-cover" />
              <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100
                transition-opacity flex items-center justify-center gap-3">
                <span className="text-white text-sm font-medium bg-ink/60 px-3 py-1 rounded-full">
                  Click to change
                </span>
                <button
                  onClick={removeImage}
                  className="text-white text-sm font-medium bg-rust/80 hover:bg-rust px-3 py-1 rounded-full transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center gap-2 text-warm-gray/70 select-none">
              <svg className="w-7 h-7 opacity-50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M16.5 3.75h3a.75.75 0 01.75.75v3" />
              </svg>
              <p className="text-sm">
                <span className="text-amber-700 font-medium">Click to upload</span> or drag &amp; drop
              </p>
              <p className="text-xs text-warm-gray/50">Optional · PNG, JPG, WEBP up to 10 MB</p>
            </div>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files[0])} />

        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="cursor-pointer mt-4 w-full bg-ink text-parchment font-medium text-sm rounded-xl py-3 px-6
            hover:bg-charcoal active:scale-[0.98] transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin-slow" />
              Publishing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Publish Post
            </>
          )}
        </button>
      </div>
    </div>
  );
}
