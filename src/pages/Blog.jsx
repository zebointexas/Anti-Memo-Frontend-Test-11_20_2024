import { useState, useEffect } from "react";
import api from "../api";

function CreateBlog() {
    const [blog_name, setName] = useState(""); // 存储博客标题
    const [blog_type, setType] = useState(""); // 存储博客标题
    const [blog_content, setContent] = useState(""); // 存储博客内容
    const [blogs, setBlogs] = useState([]); // 存储所有博客列表
    const [loading, setLoading] = useState(true); // 加载状态
    const [error, setError] = useState(null); // 错误状态
    const [selectedFilter, setSelectedFilter] = useState("All"); // 默认显示所有

    const handleFilterChange = (event) => {
        setSelectedFilter(event.target.value);
    };
    
    const filteredBlogs = selectedFilter === "All" ? blogs : blogs.filter((blog) => blog.blog_type === selectedFilter);

    // 页面加载时，从 localStorage 获取之前保存的博客内容
    useEffect(() => {
        // 获取已保存的博客标题和内容
        const savedName = localStorage.getItem('blog_name');
        const savedContent = localStorage.getItem('blog_content');
        const savedType = localStorage.getItem('blog_type');
    

        if (savedName) setName(savedName);
        if (savedContent) setContent(savedContent);
        if (savedType) setType(savedType);

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

    const handleTypeChange = (e, id) => {
        const updatedType = e.target.value;
        setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
                blog.id === id ? { ...blog, blog_type: updatedType } : blog
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
        localStorage.setItem('blog_type', blog_type);
    }, [blog_name, blog_content, blog_type]);

    // 提交表单
    const createBlog = (e) => {
        e.preventDefault();
 
        // 验证必填字段
        if (!blog_name || !blog_content || !blog_type) {
            alert("Please fill all required fields!");
            return;
        }

        const blogData = {
            blog_name: blog_name,
            blog_content: blog_content,
            blog_type: blog_type,
        };
 
        console.log(blogData);

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
                    localStorage.removeItem('blog_type');
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
        const { blog_name, blog_content, blog_type } = updatedBlog;
    
        if (!isConfirmed) {
            return; // 用户点击了取消，退出方法
        }
    
        api
            .patch(`/api/blog/update/${id}/`, { blog_name, blog_content, blog_type })
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
            <div>
                <p><a href="https://www.linkedin.com/in/sarrabounouh/" target="_blank" rel="noopener noreferrer">Sarra Bounouh</a></p>
            </div>            
            <div>
                <h2 className="center-text">Create a New Blog</h2>
                <form onSubmit={createBlog}>
                    <label htmlFor="name">Blog Name:</label>
                    <br />
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={blog_name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <br />


                    <label htmlFor="blog_type">Blog Type:&nbsp;&nbsp;&nbsp;&nbsp;</label> 
                    <label className="labelForCreate">
                        Personal     
                        <input
                            type="radio"
                            name="blog_type"
                            value="Personal"
                            checked={blog_type === "Personal"}
                            onChange={(e) => setType(e.target.value)}
                        />                        
                    </label>
                    <label className="labelForCreate">
                        Drive
                        <input
                            type="radio"
                            name="blog_type"
                            value="Drive"
                            checked={blog_type === "Drive"}
                            onChange={(e) => setType(e.target.value)}
                        />                        
                    </label>
                    <label className="labelForCreate">
                        Inspire
                        <input
                            type="radio"
                            name="blog_type"
                            value="Inspire"
                            checked={blog_type === "Inspire"}
                            onChange={(e) => setType(e.target.value)}
                        />                        
                    </label>

                    <br />
                    <br />

                    <label className="blogContentCreate" htmlFor="content">Blog Content:</label>
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

                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
            </div>


            {/* 显示加载状态 */}
            {loading && <p>Loading blogs...</p>}

            {/* 显示错误信息 */}
            {error && <p>{error}</p>}

            {/* 显示博客列表 */}
            
            <p><a href="https://photos.google.com/u/3/albums" target="_blank" rel="noopener noreferrer">https://photos.google.com/u/3/albums</a></p>

            <div>
                <h3>All Blogs</h3>

                <div className="select-type-edit">
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            value="Personal"
                            checked={selectedFilter === "Personal"}
                            onChange={handleFilterChange}
                        />
                        Personal
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            value="Drive"
                            checked={selectedFilter === "Drive"}
                            onChange={handleFilterChange}
                        />
                        Drive
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="filter"
                            value="Inspire"
                            checked={selectedFilter === "Inspire"}
                            onChange={handleFilterChange}
                        />
                        Inspire
                    </label>
                </div>

                <ul>
                    {filteredBlogs.map((blog) => (
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
                           
                            {blog.isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={blog.blog_name}
                                        onChange={(e) => handleNameChange(e, blog.id)}
                                        className="blog-name-input"
                                    />
                                    <div className="select-type-edit">
                                        <label>
                                            Personal
                                            <input
                                                type="radio"
                                                name={`blog_type_${blog.id}`}
                                                value="Personal"
                                                checked={blog.blog_type === "Personal"}
                                                onChange={(e) => handleTypeChange(e, blog.id)}
                                            />                                            
                                        </label>
                                        <label>
                                            Drive
                                            <input
                                                type="radio"
                                                name={`blog_type_${blog.id}`}
                                                value="Drive"
                                                checked={blog.blog_type === "Drive"}
                                                onChange={(e) => handleTypeChange(e, blog.id)}
                                            />                                            
                                        </label>
                                        <label>
                                        Inspire
                                            <input
                                                type="radio"
                                                name={`blog_type_${blog.id}`}
                                                value="Inspire"
                                                checked={blog.blog_type === "Inspire"}
                                                onChange={(e) => handleTypeChange(e, blog.id)}
                                            />                                            
                                        </label>
                                    </div>
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
                            <p>Created On: <span>{new Date(blog.created_at).toLocaleDateString()}</span></p>
                        </li>
                    ))}
                </ul>
            </div>

            <style>
                {`
                    .center-text {
                        text-align: center;
                    }
                        
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

                    .blog-type-select {
                        width: 100%;
                        padding: 10px;
                        font-size: 16px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        background-color: #fff;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        appearance: none; /* 去除默认下拉箭头 */
                        -webkit-appearance: none;
                        -moz-appearance: none;
                        color: #333;
                        cursor: pointer;
                        transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    }

                    .blog-type-select:focus {
                        border-color: #4CAF50;
                        box-shadow: 0 0 8px rgba(72, 184, 72, 0.5);
                    }

                    .blog-type-select option {
                        font-size: 16px;
                    }

                    .blog-type-select::-ms-expand {
                        display: none; /* 隐藏 IE 下的下拉箭头 */
                    }

                    .blog-type-select {
                        padding-right: 30px; /* 留出空间给自定义箭头 */
                    }

                    .blog-type-select::after {
                        content: '';
                        position: absolute;
                        right: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        border: solid transparent;
                        border-width: 6px 6px 0 6px;
                        border-top-color: #333;
                        pointer-events: none;
                    }

                    form select {
                        width: 100%;
                        padding: 10px;
                        margin: 8px 0 16px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        box-sizing: border-box;
                        font-size: 16px;
                        margin-top: 12px; /* 添加一些上边距，增加与上方元素的距离 */
                    }

                    .labelForCreate {
                        display: inline-flex;  /* 让 label 内的元素按行排列 */
                        align-items: center;   /* 使 label 内的内容垂直居中对齐 */
                        margin-right: 20px;     /* 每个 label 之间增加一点空间 */
                        font-weight: normal;   /* 确保去除粗体 */
                    }

                    input[type="radio"] {
                        margin: 0;  /* 移除默认的 margin */
                        margin-left: 5px;
                    } 

                    .select-type-edit {
                        display: flex; /* 使用 flexbox 排列 */
                        flex-direction: row; /* 水平排列 */
                        gap: 20px; /* 为标签之间添加间距 */
                        align-items: center; /* 垂直居中 */
                        margin-bottom: 20px; /* 为整个选择区域添加下边距 */
                    }

                    .select-type-edit label {
                        font-size: 16px; /* 设置字体大小 */
                        font-weight: normal; /* 设置标签文字为正常字体 */
                        display: flex; /* 使用 flexbox 让文本与输入框水平排列 */
                        align-items: center; /* 让文本和输入框垂直居中 */
                    }

                    .select-type-edit input[type="radio"] {
                        margin-left: 8px; /* 为每个 radio 按钮增加左边距 */
                        margin-right: 10px; /* 为每个 radio 按钮增加右边距 */
                    }

                    .select-type-edit label:hover {
                        cursor: pointer; /* 鼠标悬停时显示为指针形状 */
                    }

                    .select-type-edit input[type="radio"]:checked {
                        accent-color: #4CAF50; /* 为选中的 radio 按钮设置颜色 */
                    }
                `}
            </style>
        </div>
    );
}

export default CreateBlog;
