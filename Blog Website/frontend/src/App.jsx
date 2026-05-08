import Header from "./components/Header";
import CreatePost from "./components/CreatePost";
import BlogGrid from "./components/BlogGrid";
import Footer from "./components/Footer";
import { useBlogs } from "./hooks/useBlogs";

export default function App() {
    const { blogs, loading, error, createBlog, deleteBlog } = useBlogs();

    return (
        <div className="relative min-h-screen">
            <Header count={blogs.length} />
            <main>
                <CreatePost onCreate={createBlog} />
                <BlogGrid
                    blogs={blogs}
                    loading={loading}
                    error={error}
                    onDelete={deleteBlog}
                />
            </main>
            <Footer />
        </div>
    );
}