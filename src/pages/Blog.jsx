import { useState, useEffect } from "react";
import api from "../api";

function CreateBlog() {
    const [blog_name, setTitle] = useState("");  // 存储博客标题
    const [blog_content, setContent] = useState("");  // 存储博客内容
    const [blogs, setBlogs] = useState([]);  // 存储所有博客列表
    const [loading, setLoading] = useState(true);  // 加载状态
    const [error, setError] = useState(null);  // 错误状态

    // 获取所有博客数据
    useEffect(() => {
        api
            .get("/api/blog_list/")  // 请求博客列表的 API
            .then((res) => {
                if (res.status === 200) {
                    const blogsWithState = res.data.map((blog) => ({
                        ...blog,
                        isVisible: false, // 每条记录初始内容为隐藏状态
                    }));
                    setBlogs(blogsWithState);  // 设置博客列表
                    setLoading(false);  // 更新加载状态
                } else {
                    setError("Failed to load blogs.");
                    setLoading(false);
                }
            })
            .catch((err) => {
                setError("Failed to load blogs.");
                setLoading(false);
            });
    }, []);

    // 切换内容显示状态
    const toggleContent = (id) => {
        setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
                blog.id === id ? { ...blog, isVisible: !blog.isVisible } : blog
            )
        );
    };

    // 提交表单
    const createBlog = (e) => {
        e.preventDefault();

        // 验证必填字段
        if (!blog_name || !blog_content) {
            alert("Please fill all required fields!");
            return;
        }

        const blogData = {
            blog_name: blog_name,
            blog_content: blog_content,
        };

        api
            .post("/api/blog/create/", blogData)  // 发送到创建博客的 API
            .then((res) => {
                if (res.status === 201) {
                    console.log("Blog was created!");
                    alert("Blog was created!");
                    // 在博客创建后重新获取博客列表
                    setBlogs([...blogs, { ...res.data, isVisible: false }]);
                } else {
                    console.log("Failed to create Blog.");
                }
            })
            .catch((err) => alert(err));
    };

    // 将文本中的 URL 转换为超链接
    const convertLinksToHtml = (text) => {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return text.replace(urlPattern, (url) => {
            return `<a href="${url}" target="_blank" style="color: #007BFF; text-decoration: none;">${url}</a>`;
        });
    };

    return (
        <div>
            <h2>Create a New Blog</h2>
            <form onSubmit={createBlog}>
                <label htmlFor="title">Blog Name:</label>
                <br />
                <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={blog_name}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <br />

                <label htmlFor="content">Blog Content:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={blog_content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <br />
                <input type="submit" value="Submit" />
            </form>

            {/* 显示加载状态 */}
            {loading && <p>Loading blogs...</p>}

            {/* 显示错误信息 */}
            {error && <p>{error}</p>}

            {/* 显示博客列表 */}

            <p><a href="https://photos.google.com/u/3/albums" target="_blank" rel="noopener noreferrer">https://photos.google.com/u/3/albums</a></p>

            <div>
                <h3>All Blogs</h3>
                <ul>
                    {blogs.map((blog) => (
                        <li
                            key={blog.id}
                            style={{
                                backgroundColor: blog.id % 2 === 0 ? "#f9f9f9" : "#e6f7ff",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "8px",
                                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <h4>{blog.blog_name}</h4>
                            <button
                                onClick={() => toggleContent(blog.id)}
                                style={{
                                    margin: "10px 0",
                                    padding: "5px 10px",
                                    backgroundColor: "#007BFF",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                            >
                                {blog.isVisible ? "Hide Content" : "Show Content"}
                            </button>
                            {blog.isVisible && (
                                <p
                                    style={{ whiteSpace: "pre-wrap" }}
                                    dangerouslySetInnerHTML={{
                                        __html: convertLinksToHtml(blog.blog_content),
                                    }}
                                />
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <style>
                {`

                    /* Styles for the form section */
                    form {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        max-width: 1250px; /* 最后的最大宽度 */
                        margin: auto;
                    }

                    form h2 {
                        color: #333;
                        font-size: 24px;
                        margin-bottom: 20px;
                    }

                    form label {
                        font-weight: bold;
                        margin-top: 10px;
                    }

                    form input,
                    form textarea {
                        width: 100%;
                        padding: 10px;
                        margin: 8px 0 16px;
                        border: 1px solid #ccc;
                        border-radius: 8px; /* 保持一致的圆角 */
                        box-sizing: border-box;
                        font-size: 16px; /* 保持一致的字体大小 */
                    }

                    form textarea {
                        height: 700px; /* 高度定义 */
                        resize: vertical; /* 允许垂直调整大小 */
                    }

                    form input[type="submit"] {
                        font-size: 16px;
                        padding: 10px 20px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }

                    form input[type="submit"]:hover {
                        background-color: #45a049;
                    }

                    div {
                        margin-top: 20px;
                    }

                    ul {
                        list-style-type: none;
                        padding: 0;
                    }

                    li {
                        transition: all 0.2s;
                    }

                    h4 {
                        margin: 0;
                        font-size: 18px;
                        color: #333;
                    }

                    p {
                        margin: 5px 0 0;
                        color: #555;
                    }

    
                `}
            </style>
        </div>
    );
}

export default CreateBlog;
