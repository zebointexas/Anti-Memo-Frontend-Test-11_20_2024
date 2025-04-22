import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlogName, setEditedBlogName] = useState("");
  const contentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/blog/${id}/`)
      .then((res) => {
        if (res.status === 200) {
          setBlog(res.data);
          setEditedBlogName(res.data[0].blog_name);
        } else {
          setError("API returned status: " + res.status);
        }
      })
      .catch((err) => setError("API Error: " + err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const formatContentForDisplay = (content) => {
    if (!content) return "";
    const hasHtml = /<[^>]+>/.test(content);
    if (hasHtml) return content;

    const normalizedContent = content.replace(/\n{3,}/g, "\n\n");
    const formattedContent = normalizedContent.replace(
      /(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/g,
      (url) => `<a href="${url}" target="_blank" class="link-style">${url}</a>`
    );
    return formattedContent.replace(/\n/g, "<br>");
  };

  const handleLink = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      let url = prompt("Enter the URL (include http:// or https:// if needed):");
      if (url) {
        if (!url.match(/^https?:\/\//)) {
          url = "https://" + url;
        }
        const range = selection.getRangeAt(0);
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.className = "link-style";
        link.textContent = selection.toString() || url;
        range.deleteContents();
        range.insertNode(link);
      }
    }
  };

  const convertUrlsToLinks = (htmlContent) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    const processNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const urlPattern = /(https?:\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])|(www\.[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|])/g;
        if (urlPattern.test(text)) {
          const html = text.replace(urlPattern, (match) => {
            const url = match.startsWith("http") ? match : `https://${match}`;
            return `<a href="${url}" target="_blank" class="link-style">${match}</a>`;
          });
          const fragment = document.createRange().createContextualFragment(html);
          node.replaceWith(fragment);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "A") {
        Array.from(node.childNodes).forEach(processNode);
      }
    };

    Array.from(tempDiv.childNodes).forEach(processNode);
    return tempDiv.innerHTML;
  };

  const handleSave = () => {
    let content = contentRef.current.innerHTML;
    content = content.replace(/<br\s*\/?>\s*<br\s*\/?>\s*<br\s*\/?>/gi, '<br><br>');
    content = convertUrlsToLinks(content);

    api
      .patch(`/api/blog/update/${id}/`, {
        blog_content: content,
        blog_name: editedBlogName,
        blog_type: blog[0].blog_type,
      })
      .then((res) => {
        if (res.status === 200) {
          setBlog([{ ...blog[0], blog_content: content, blog_name: editedBlogName }]);
          setIsEditing(false);
        } else {
          alert("Failed to save content");
        }
      })
      .catch((err) => alert("Error saving content: " + err.message));
  };

  const handleDelete = () => {
    const firstConfirm = window.confirm(
      "Are you sure you want to delete this blog?"
    );
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      "This action cannot be undone. Really delete this blog?"
    );
    if (!secondConfirm) return;

    api
      .delete(`/api/blog/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) {
          alert("Blog deleted successfully!");
          navigate("/blog");
        } else {
          alert("Failed to delete blog");
        }
      })
      .catch((err) => alert("Error deleting blog: " + err.message));
  };

  const handleLinkClick = (e) => {
    if (!isEditing) {
      const link = e.target.closest("a");
      if (link) {
        e.preventDefault();
        window.open(link.href, "_blank");
      }
    }
  };

  if (loading) return <p>Loading blog...</p>;
  if (error) return <p>{error}</p>;
  if (!blog) return <p>No blog found.</p>;

  const formattedContent = formatContentForDisplay(blog[0].blog_content);

  return (
    <div className="blog-container">
      <div className="floating-buttons">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="floating-button save-button">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="floating-button cancel-button">
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="floating-button edit-button"
          >
            Edit<br/>Content
          </button>
        )}
      </div>

      {isEditing ? (
        <>
          <input
            type="text"
            value={editedBlogName}
            onChange={(e) => setEditedBlogName(e.target.value)}
            className="blog-title-input"
          />
          <div className="editor-container">
            <div className="editor-toolbar">
              <button onClick={handleLink} className="toolbar-button">
                Add Link
              </button>
            </div>
            <div
              ref={contentRef}
              contentEditable
              className="content-editable"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        </>
      ) : (
        <div className="blog-view-container">
          <h2>{blog[0].blog_name}</h2>
          <p>Type: {blog[0].blog_type}</p>
          <div
            dangerouslySetInnerHTML={{ __html: formattedContent }}
            className="blog-content"
            onClick={handleLinkClick}
          />
          {/* <div className="bottom-button-container">
            <button onClick={handleDelete} className="delete-button">
              Delete
            </button>
          </div> */}
        </div>
      )}

      {/* <div className="bottom-button-fixed-container">
        <button onClick={handleDelete} className="delete-button bottom-delete-button">
          Delete This Blog
        </button>
      </div> */}


      <p>Created On: {new Date(blog[0].created_at).toLocaleDateString()}</p>
      <a href="/blog" className="back-link">
        Back to Blog List
      </a>

      <style>
        {`
          .blog-container {
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            min-height: 400px;
          }

          .blog-view-container {
            position: relative;
            min-height: 300px;
          }

          .blog-title-input {
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            font-size: 1.5em;
            border: 1px solid #ccc;
            border-radius: 4px;
            outline: none;
          }

          .blog-title-input:focus {
            border-color: #007BFF;
            box-shadow: 0 0 5px rgba(0,123,255,0.3);
          }

          .editor-container {
            position: relative;
          }

          .editor-toolbar {
            margin-bottom: 10px;
            padding: 5px;
            background-color: #f5f5f5;
            border-radius: 4px;
            position: sticky;
            top: 0;
            z-index: 10;
          }

          .toolbar-button {
            padding: 5px 10px;
            margin-right: 5px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
          }

          .toolbar-button:hover {
            background-color: #e0e0e0;
          }

          .content-editable {
            width: 100%;
            min-height: 300px;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            line-height: 1.5;
            outline: none;
            white-space: normal;
            word-wrap: break-word;
            overflow-wrap: break-word;
          }

          .content-editable:focus {
            border-color: #007BFF;
            box-shadow: 0 0 5px rgba(0,123,255,0.3);
          }

          .bottom-button-container {
            margin: 15px 0;
            display: flex;
            gap: 10px;
          }

          .delete-button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            background-color: #999;
            color: white;
          }
          
          .delete-button:hover {
            background-color: #777;
          }

          .floating-buttons {
            position: fixed;
            left: calc(50% - 520px); /* 从 -480px 调整为 -520px，进一步靠左 */
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 100;
          }

          @media (max-width: 1200px) {
            .floating-buttons {
              left: 50px; /* 更宽松的间距 */
            }
          }

          @media (max-width: 1000px) {
            .floating-buttons {
              left: 20px; /* 稍微靠左但不贴边 */
            }
          }

          @media (max-width: 600px) {
            .floating-buttons {
              position: sticky;
              top: 10px;
              left: auto;
              transform: none;
              flex-direction: row;
              margin-bottom: 10px;
            }
          }

          .floating-button {
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            text-align: center;
            line-height: 1.2;
            min-width: 70px;
          }

          .edit-button {
            background-color: #007BFF;
            color: white;
          }

          .edit-button:hover {
            background-color: #0056b3;
            box-shadow: 3px 3px 8px rgba(0,0,0,0.3);
          }

          .save-button {
            background-color: #4CAF50;
            color: white;
          }

          .save-button:hover {
            background-color: #45a049;
            box-shadow: 3px 3px 8px rgba(0,0,0,0.3);
          }

          .cancel-button {
            background-color: #666;
            color: white;
          }

          .cancel-button:hover {
            background-color: #555;
            box-shadow: 3px 3px 8px rgba(0,0,0,0.3);
          }

          .blog-content {
            word-wrap: break-word;
            overflow-wrap: break-word;
            hyphens: auto;
            white-space: normal;
          }

          .back-link, .link-style {
            color: #007BFF;
            text-decoration: none;
          }

          .back-link:hover {
            text-decoration: underline;
          }

          body {
            background-color: #f6f4e6; /* 护眼的浅米色背景 */
            background-image: url('https://www.transparenttextures.com/patterns/paper-fibers.png'); /* 纸张纹理图 */
            background-repeat: repeat;
            font-family: 'Georgia', serif;
          }

          .blog-container {
            background-color: rgba(255, 255, 255, 0.88); /* 淡白色背景，略透明像纸张 */
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            backdrop-filter: blur(2px);
            border: 1px solid #e0dccc;
          }

          .bottom-button-fixed-container {
            margin-top: 80px;
            padding-top: 40px;
            border-top: 1px dashed #ccc;
            text-align: center;
          }

          .bottom-delete-button {
            padding: 12px 24px;
            font-size: 16px;
            background-color: #a94442;
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .bottom-delete-button:hover {
            background-color: #843534;
          }

        `}
      </style>
    </div>
  );
}

export default BlogDetail;