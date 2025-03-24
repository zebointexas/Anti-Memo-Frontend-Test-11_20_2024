import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function CreateBlog() {
  const [blog_name, setName] = useState("");
  const [blog_type, setType] = useState("");
  const [blog_content, setContent] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
  };

  const filteredBlogs =
    selectedFilter === "All"
      ? blogs
      : blogs.filter((blog) => blog.blog_type === selectedFilter);

  useEffect(() => {
    const savedName = localStorage.getItem("blog_name");
    const savedContent = localStorage.getItem("blog_content");
    const savedType = localStorage.getItem("blog_type");

    if (savedName) setName(savedName);
    if (savedContent) setContent(savedContent);
    if (savedType) setType(savedType);

    api
      .get("/api/blog_list/")
      .then((res) => {
        if (res.status === 200) {
          const blogsWithState = res.data.map((blog) => ({
            ...blog,
            isVisible: false,
            isEditing: false,
          }));
          setBlogs(blogsWithState);
          setLoading(false);
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

  const handleContentChange = (e, id) => {
    const updatedContent = e.target.value;
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog.id === id ? { ...blog, blog_content: updatedContent } : blog
      )
    );
  };

  useEffect(() => {
    localStorage.setItem("blog_name", blog_name);
    localStorage.setItem("blog_content", blog_content);
    localStorage.setItem("blog_type", blog_type);
  }, [blog_name, blog_content, blog_type]);

  // 将纯文本中的 URL（包括 www. 开头）转换为超链接
  const convertUrlsToLinks = (text) => {
    const urlPattern = /(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])|(www\.[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/g;
    const lines = text.split(/\n/);
    const formattedLines = lines.map((line) => {
      if (urlPattern.test(line)) {
        return line.replace(urlPattern, (match) => {
          const url = match.startsWith("http") ? match : `https://${match}`;
          return `<a href="${url}" target="_blank" class="link-style">${match}</a>`;
        });
      }
      return line;
    });
    return formattedLines.join("<br>");
  };

  // 提交表单
  const createBlog = (e) => {
    e.preventDefault();

    if (!blog_name || !blog_content || !blog_type) {
      alert("Please fill all required fields!");
      return;
    }

    // 在创建时将 URL 转换为超链接
    const formattedContent = convertUrlsToLinks(blog_content);
    const blogData = {
      blog_name,
      blog_content: formattedContent,
      blog_type,
    };

    api
      .post("/api/blog/create/", blogData)
      .then((res) => {
        if (res.status === 201) {
          alert("Blog was created!");
          setBlogs([
            ...blogs,
            { ...res.data, isVisible: false, isEditing: false },
          ]);
          setName("");
          setType("");
          setContent("");
          localStorage.removeItem("blog_name");
          localStorage.removeItem("blog_content");
          localStorage.removeItem("blog_type");
        } else {
          console.log("Failed to create Blog.");
        }
      })
      .catch((err) => alert(err));
  };

  // 保存编辑的博客
  const saveEditedBlog = (id) => {
    const updatedBlog = blogs.find((blog) => blog.id === id);
    const { blog_name, blog_content, blog_type } = updatedBlog;

    // 在保存编辑时也将 URL 转换为超链接
    const formattedContent = convertUrlsToLinks(blog_content);

    api
      .patch(`/api/blog/update/${id}/`, {
        blog_name,
        blog_content: formattedContent,
        blog_type,
      })
      .then((res) => {
        if (res.status === 200) {
          alert("Already saved it!");
          setBlogs((prevBlogs) =>
            prevBlogs.map((blog) =>
              blog.id === id
                ? { ...blog, blog_content: formattedContent, isEditing: false }
                : blog
            )
          );
        } else {
          alert("Failed to update blog.");
        }
      })
      .catch((err) => alert(err));
  };

  return (
    <div>
      <div>
        <p>
          <a
            href="https://www.linkedin.com/in/sarrabounouh/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sarra Bounouh
          </a>
        </p>
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

          <label htmlFor="blog_type">Blog Type:    </label>
          <label className="labelForCreate">
            Diary
            <input
              type="radio"
              name="blog_type"
              value="Personal"
              checked={blog_type === "Personal"}
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
          <label className="labelForCreate">
            Tech
            <input
              type="radio"
              name="blog_type"
              value="Tech"
              checked={blog_type === "Tech"}
              onChange={(e) => setType(e.target.value)}
            />
          </label>
          <br />
          <br />

          <label className="blogContentCreate" htmlFor="content">
            Blog Content:
          </label>
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
      </div>

      {loading && <p>Loading blogs...</p>}
      {error && <p>{error}</p>}


      <div>
        <div>
          <h3>All Blogs</h3>

          <div className="select-type-edit">
            <label>
              All
              <input
                type="radio"
                name="filter_type"
                value="All"
                checked={selectedFilter === "All"}
                onChange={handleFilterChange}
              />
            </label>
            <label>
              Diary
              <input
                type="radio"
                name="filter_type"
                value="Personal"
                checked={selectedFilter === "Personal"}
                onChange={handleFilterChange}
              />
            </label>
            <label>
              Inspire
              <input
                type="radio"
                name="filter_type"
                value="Inspire"
                checked={selectedFilter === "Inspire"}
                onChange={handleFilterChange}
              />
            </label>
            <label>
              Tech
              <input
                type="radio"
                name="filter_type"
                value="Tech"
                checked={selectedFilter === "Tech"}
                onChange={handleFilterChange}
              />
            </label>
          </div>

          <ul>
            {filteredBlogs.map((blog) => (
              <li key={blog.id} className="blog-list-item">
                <h4 className="heading-container">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link
                      to={`/blog/${blog.id}`}
                      style={{ textDecoration: "none", color: "#333" }}
                    >
                      {blog.blog_name}
                    </Link>
                    {!blog.isEditing && (
                      <button
                        onClick={() => toggleContent(blog.id)}
                        className="toggle-button"
                      >
                        {blog.isVisible ? "Hide Content" : "Show Content"}
                      </button>
                    )}
                  </div>
                  <span>
                    Created On:{" "}
                    <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                  </span>
                </h4>

                {blog.isVisible && (
                  <div
                    className="blog-content"
                    dangerouslySetInnerHTML={{ __html: blog.blog_content }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>




        <ul>
          {filteredBlogs.map((blog) => (
            <li key={blog.id} className="blog-list-item">
              <h4 className="heading-container">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Link
                    to={`/blog/${blog.id}`}
                    style={{ textDecoration: "none", color: "#333" }}
                  >
                    {blog.blog_name}
                  </Link>
                  {!blog.isEditing && (
                    <button
                      onClick={() => toggleContent(blog.id)}
                      className="toggle-button"
                    >
                      {blog.isVisible ? "Hide Content" : "Show Content"}
                    </button>
                  )}
                </div>
                <span>
                  Created On:{" "}
                  <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                </span>
              </h4>

               
                  {blog.isVisible && (
                    <>
                      <div
                        className="blog-content"
                        dangerouslySetInnerHTML={{ __html: blog.blog_content }}
                      />
                    </>
                  )}

              
            </li>
          ))}
        </ul>
      </div>

      <style>
        {`
          .heading-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .blog-list-item {
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }

          .blog-list-item:nth-child(even) {
            background-color: #f9f9f9;
          }

          .blog-list-item:nth-child(odd) {
            background-color: #e6f7ff;
          }

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
            width: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 8px;
            box-sizing: border-box;
            resize: vertical;
            min-height: 600px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            white-space: pre-wrap;
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
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            white-space: pre-wrap;
          }

          .link-style {
            color: #007BFF;
            text-decoration: none;
          }

          .link-style:hover {
            text-decoration: underline;
          }

          .labelForCreate {
            display: inline-flex;
            align-items: center;
            margin-right: 20px;
            font-weight: normal;
          }

          input[type="radio"] {
            margin: 0;
            margin-left: 5px;
          }

          .select-type-edit {
            display: flex;
            flex-direction: row;
            gap: 20px;
            align-items: center;
            margin-bottom: 20px;
          }

          .select-type-edit label {
            font-size: 16px;
            font-weight: normal;
            display: flex;
            align-items: center;
          }

          .select-type-edit input[type="radio"] {
            margin-left: 8px;
            margin-right: 10px;
          }

          .select-type-edit label:hover {
            cursor: pointer;
          }

          .select-type-edit input[type="radio"]:checked {
            accent-color: #4CAF50;
          }
        `}
      </style>
    </div>
  );
}

export default CreateBlog;