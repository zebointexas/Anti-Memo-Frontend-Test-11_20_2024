import { useState, useEffect } from "react";
import api from "../api";

function CreateBlog() {
    const [blog_name, setTitle] = useState(""); // 存储博客标题
    const [blog_content, setContent] = useState(""); // 存储博客内容
    const [blogs, setBlogs] = useState([]); // 存储所有博客列表
    const [loading, setLoading] = useState(true); // 加载状态
    const [error, setError] = useState(null); // 错误状态

    // 页面加载时，从 localStorage 获取之前保存的博客内容
    useEffect(() => {
        // 获取已保存的博客标题和内容
        const savedTitle = localStorage.getItem('blog_name');
        const savedContent = localStorage.getItem('blog_content');
        
        if (savedTitle) setTitle(savedTitle);
        if (savedContent) setContent(savedContent);

        // 获取所有博客数据
        api
            .get("/api/blog_list/") // 请求博客列表的 API
            .then((res) => {
                if (res.status === 200) {
                    const blogsWithState = res.data.map((blog) => ({
                        ...blog,
                        isVisible: false, // 每条记录初始内容为隐藏状态
                        isEditing: false,  // 是否处于编辑模式
                    }));
                    setBlogs(blogsWithState); // 设置博客列表
                    setLoading(false); // 更新加载状态
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

    // 切换编辑模式
    const toggleEditMode = (id) => {
        setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
                blog.id === id ? { ...blog, isEditing: !blog.isEditing } : blog
            )
        );
    };

    const handleNameChange = (e, id) => {
        const updatedName = e.target.value;
        setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
                blog.id === id ? { ...blog, blog_name: updatedName } : blog
            )
        );
    };

    // 更新博客内容
    const handleContentChange = (e, id) => {
        const updatedContent = e.target.value;
        setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
                blog.id === id ? { ...blog, blog_content: updatedContent } : blog
            )
        );
    };

    // 保存当前输入的博客标题和内容到 localStorage
    useEffect(() => {
        // 每次 blog_name 或 blog_content 变化时，保存到 localStorage
        localStorage.setItem('blog_name', blog_name);
        localStorage.setItem('blog_content', blog_content);
    }, [blog_name, blog_content]);

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
            .post("/api/blog/create/", blogData) // 发送到创建博客的 API
            .then((res) => {
                if (res.status === 201) {
                    console.log("Blog was created!");
                    alert("Blog was created!");
                    // 在博客创建后重新获取博客列表
                    setBlogs([...blogs, { ...res.data, isVisible: false, isEditing: false }]);
                    // 清空 localStorage 中的内容
                    localStorage.removeItem('blog_name');
                    localStorage.removeItem('blog_content');
                } else {
                    console.log("Failed to create Blog.");
                }
            })
            .catch((err) => alert(err));
    };

    // 保存编辑的博客
    const saveEditedBlog = (id) => {

        alert("Are you sure want to update the content?");
        alert("You will lose the previous version. Confirm?");

        const isConfirmed = window.confirm("Are you sure you want to update the content? You will lose the previous version. Confirm?");
    
        const updatedBlog = blogs.find(blog => blog.id === id);
        const { blog_name, blog_content } = updatedBlog;
    
        if (!isConfirmed) {
            return; // 用户点击了取消，退出方法
        }
    
        api
            .patch(`/api/blog/update/${id}/`, { blog_name, blog_content })
            .then((res) => {
                if (res.status === 200) {
                    setBlogs((prevBlogs) =>
                        prevBlogs.map((blog) =>
                            blog.id === id ? { ...blog, isEditing: false } : blog
                        )
                    );
                } else {
                    alert("Failed to update blog.");
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
                            {/* {blog.isEditing ? (
                                <>
                                    <textarea
                                        value={blog.blog_content}
                                        onChange={(e) => handleContentChange(e, blog.id)}
                                        className="blog-textarea"
                                    />
                                    <button
                                        onClick={() => saveEditedBlog(blog.id)}
                                        className="save-button"
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => toggleContent(blog.id)}
                                        className="toggle-button"
                                    >
                                        {blog.isVisible ? "Hide Content" : "Show Content"}
                                    </button>
                                    {blog.isVisible && (
                                        <>
                                            <p
                                                className="blog-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: convertLinksToHtml(blog.blog_content),
                                                }}
                                            />
                                            <button
                                                onClick={() => toggleEditMode(blog.id)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </>
                            )} */}

                            {blog.isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={blog.blog_name}
                                        onChange={(e) => handleNameChange(e, blog.id)}
                                        className="blog-name-input"
                                    />
                                    <textarea
                                        value={blog.blog_content}
                                        onChange={(e) => handleContentChange(e, blog.id)}
                                        className="blog-textarea"
                                    />
                                    <button
                                        onClick={() => saveEditedBlog(blog.id)}
                                        className="save-button"
                                    >
                                        Save
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => toggleContent(blog.id)}
                                        className="toggle-button"
                                    >
                                        {blog.isVisible ? "Hide Content" : "Show Content"}
                                    </button>
                                    {blog.isVisible && (
                                        <>
                                            <h4>{blog.blog_name}</h4>
                                            <p
                                                className="blog-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: convertLinksToHtml(blog.blog_content),
                                                }}
                                            />
                                            <button
                                                onClick={() => toggleEditMode(blog.id)}
                                                className="edit-button"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <style>
                {`
                    .blog-name-input {
                        width: 100%;
                        padding: 10px;
                        font-size: 16px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        box-sizing: border-box;
                        margin-bottom: 10px;
                    }

                    form {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        max-width: 1250px;
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
                        border-radius: 8px;
                        box-sizing: border-box;
                        font-size: 16px;
                    }

                    form textarea {
                        height: 700px;
                        resize: vertical;
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

                    .blog-textarea {
                        width: 100%; /* 确保宽度自适应 */
                        padding: 10px;
                        font-size: 16px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        box-sizing: border-box;
                        resize: vertical; /* 允许垂直调整 */
                        min-height: 600px; /* 最小高度，避免过小 */
                    }

                    .save-button {
                        margin-top: 10px;
                        padding: 5px 10px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }

                    .toggle-button,
                    .edit-button {
                        margin: 10px 0;
                        padding: 5px 10px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }

                    .toggle-button {
                        background-color: #007BFF;
                        color: white;
                    }

                    .edit-button {
                        background-color: #FFA500;
                        color: white;
                    }

                    .blog-content {
                        white-space: pre-wrap;
                    }
                `}
            </style>
        </div>
    );
}

export default CreateBlog;
