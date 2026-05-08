import { useState, useEffect, useCallback } from "react";

const API_BASE = "/api/blogs";

export function useBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setBlogs(data.blogs);
    } catch (err) {
      setError(err.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlogs();
  }, [fetchBlogs]);

  const createBlog = useCallback(async (formData) => {
    const res = await fetch(API_BASE, { method: "POST", body: formData });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    await fetchBlogs();
    return data.blog;
  }, [fetchBlogs]);

  const deleteBlog = useCallback(async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { blogs, loading, error, fetchBlogs, createBlog, deleteBlog };
}