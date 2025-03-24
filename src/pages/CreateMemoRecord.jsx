import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AI from "./AI"; 


function CreateMemoRecord() {
    const [record_details, setRecord_Details] = useState("-");  // 设置默认值为"-"
    const [question, setQuestion] = useState("");
    const [subjectTypes, setSubjectTypes] = useState([]);
    const [subject_type, setSelectedSubjectType] = useState("BQ");
    const [isPreviewMode, setIsPreviewMode] = useState(false);  // 默认为false，即编辑模式
    const navigate = useNavigate();

    useEffect(() => {
        const savedRecordDetails = localStorage.getItem("record_details");
        const savedQuestion = localStorage.getItem("question");
        const savedSubjectType = localStorage.getItem("subject_type");

        // 如果localStorage有保存的值，则使用；否则使用默认值"-"
        if (savedRecordDetails) setRecord_Details(savedRecordDetails);
        if (savedQuestion) setQuestion(savedQuestion);
        if (savedSubjectType) setSelectedSubjectType(savedSubjectType);

        api.get("/api/subject_types_list/")
            .then((res) => {
                if (res.status === 200) {
                    setSubjectTypes(res.data);
                } else {
                    console.log("Failed to fetch subject types.");
                }
            })
            .catch((err) => alert(err));
    }, []);

    const createMemoRecord = (e) => {
        e.preventDefault();
        if (!subject_type) {
            alert("Please select a subject type!");
            return;
        }

        api.post("/api/memo_records/create/", { 
            record_details, 
            question,
            subject_type
        })
        .then((res) => {
            if (res.status === 201) {
                console.log("Memo record created successfully!");
                setRecord_Details("-");  // 重置为默认值"-"
                setQuestion("");
                localStorage.removeItem("record_details");
                localStorage.removeItem("question");
                localStorage.removeItem("subject_type");
                
                // 无论当前是否处于预览模式，都重置为编辑模式
                setIsPreviewMode(false);
            } else {
                console.log("Failed to create memo record.");
            }
        })
        .catch((err) => alert(err));
    };

    const goToUpdateSubjectType = () => {
        navigate("/update-subject-type");
    };

    useEffect(() => {
        localStorage.setItem("record_details", record_details);
        localStorage.setItem("question", question);
        localStorage.setItem("subject_type", subject_type);
    }, [record_details, question, subject_type]);

    // Enhanced Markdown to HTML converter
    const markdownToHtml = (markdown) => {
        if (!markdown) return "";
        
        let html = markdown;
        
        // Convert code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Convert inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Convert headers
        html = html.replace(/^##### (.*$)/gm, '<h5>$1</h5>');
        html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Convert bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert underline
        html = html.replace(/__(.*?)__/g, '<u>$1</u>');
        
        // Convert strikethrough
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');
        
        // Convert quotes
        html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
        
        // Convert unordered lists
        html = html.replace(/^\s*[\-\*] (.*$)/gm, '<li>$1</li>');
        
        // Convert ordered lists
        html = html.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
        
        // Wrap consecutive li tags in ul
        let tempHtml = html;
        html = '';
        let inList = false;
        
        tempHtml.split('\n').forEach(line => {
            if (line.indexOf('<li>') === 0) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += line;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                html += line + '\n';
            }
        });
        
        if (inList) {
            html += '</ul>';
        }
        
        // Convert links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Convert horizontal rules
        html = html.replace(/^---$/gm, '<hr>');
        
        // Convert tables (simple implementation)
        html = html.replace(/\|(.*)\|/g, function(match) {
            const cells = match.split('|').filter(cell => cell.trim() !== '');
            const row = cells.map(cell => `<td>${cell.trim()}</td>`).join('');
            return `<tr>${row}</tr>`;
        });
        
        html = html.replace(/<tr>(.*?)<\/tr>/g, function(match) {
            return `<table><tbody>${match}</tbody></table>`;
        });
        
        // Convert line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    };

    // Insert format at cursor position
    const insertFormat = (format) => {
        const textarea = document.getElementById('content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = record_details.substring(start, end);
        let formattedText = '';
        let cursorOffset = 0;
        
        switch(format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'strikethrough':
                formattedText = `~~${selectedText}~~`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'h1':
                formattedText = `# ${selectedText}`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'h2':
                formattedText = `## ${selectedText}`;
                cursorOffset = selectedText ? 0 : 3;
                break;
            case 'h3':
                formattedText = `### ${selectedText}`;
                cursorOffset = selectedText ? 0 : 4;
                break;
            case 'h4':
                formattedText = `#### ${selectedText}`;
                cursorOffset = selectedText ? 0 : 5;
                break;
            case 'blockquote':
                formattedText = `> ${selectedText}`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'code':
                formattedText = `\`${selectedText}\``;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'codeblock':
                formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
                cursorOffset = selectedText ? 0 : 4;
                break;
            case 'ul':
                formattedText = `* ${selectedText}`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'ol':
                formattedText = `1. ${selectedText}`;
                cursorOffset = selectedText ? 0 : 3;
                break;
            case 'hr':
                formattedText = `\n---\n${selectedText}`;
                cursorOffset = selectedText ? 0 : 5;
                break;
            case 'link':
                formattedText = `[${selectedText || 'Link text'}](url)`;
                cursorOffset = selectedText ? 3 : 1;
                break;
            case 'table':
                formattedText = `| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |`;
                cursorOffset = 0;
                break;
            default:
                formattedText = selectedText;
        }
        
        const newText = record_details.substring(0, start) + formattedText + record_details.substring(end);
        setRecord_Details(newText);
        
        // Return focus to text area
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + formattedText.length - cursorOffset;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    // Insert format for question field
    const insertQuestionFormat = (format) => {
        const textarea = document.getElementById('question');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = question.substring(start, end);
        let formattedText = '';
        let cursorOffset = 0;
        
        switch(format) {
            case 'bold':
                formattedText = `**${selectedText}**`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'italic':
                formattedText = `*${selectedText}*`;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'underline':
                formattedText = `__${selectedText}__`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'strikethrough':
                formattedText = `~~${selectedText}~~`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'h1':
                formattedText = `# ${selectedText}`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'h2':
                formattedText = `## ${selectedText}`;
                cursorOffset = selectedText ? 0 : 3;
                break;
            case 'h3':
                formattedText = `### ${selectedText}`;
                cursorOffset = selectedText ? 0 : 4;
                break;
            case 'h4':
                formattedText = `#### ${selectedText}`;
                cursorOffset = selectedText ? 0 : 5;
                break;
            case 'blockquote':
                formattedText = `> ${selectedText}`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'code':
                formattedText = `\`${selectedText}\``;
                cursorOffset = selectedText ? 0 : 1;
                break;
            case 'codeblock':
                formattedText = `\`\`\`\n${selectedText}\n\`\`\``;
                cursorOffset = selectedText ? 0 : 4;
                break;
            case 'ul':
                formattedText = `* ${selectedText}`;
                cursorOffset = selectedText ? 0 : 2;
                break;
            case 'ol':
                formattedText = `1. ${selectedText}`;
                cursorOffset = selectedText ? 0 : 3;
                break;
            case 'hr':
                formattedText = `\n---\n${selectedText}`;
                cursorOffset = selectedText ? 0 : 5;
                break;
            case 'link':
                formattedText = `[${selectedText || 'Link text'}](url)`;
                cursorOffset = selectedText ? 3 : 1;
                break;
            case 'table':
                formattedText = `| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |`;
                cursorOffset = 0;
                break;
            default:
                formattedText = selectedText;
        }
        
        const newText = question.substring(0, start) + formattedText + question.substring(end);
        setQuestion(newText);
        
        // Return focus to text area
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + formattedText.length - cursorOffset;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    return (
        <div className="container">
            <div className="header-container">
                <h2>Create Memo Record</h2>
                <button 
                    type="button" 
                    onClick={createMemoRecord}
                    className="submit-button"
                >
                    Submit
                </button>
            </div>

            <div className="form-wrap">
                <form onSubmit={createMemoRecord}>
                    {/* Moved the Subject Type selection to be the first form element */}
                    <div className="form-group">
                        <label htmlFor="subject-type">Subject Type:</label>
                        <select
                            id="subject-type"
                            name="subject_type"
                            value={subject_type}
                            onChange={(e) => setSelectedSubjectType(e.target.value)}
                            required
                        >
                            <option value="">Select subject</option>
                            {subjectTypes.map((subject) => (
                                <option key={subject.id} value={subject.type}>
                                    {subject.type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <div className="editor-header">
                            <label htmlFor="question">Question:</label>
                            <div className="preview-toggle">
                                <button 
                                    type="button" 
                                    onClick={() => setIsPreviewMode(!isPreviewMode)} 
                                    className={`toggle-button ${isPreviewMode ? 'active' : ''}`}
                                >
                                    {isPreviewMode ? 'Edit' : 'Preview'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="editor-toolbar">
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertQuestionFormat('bold')} className="toolbar-button" title="Bold">B</button>
                                <button type="button" onClick={() => insertQuestionFormat('italic')} className="toolbar-button" title="Italic">I</button>
                                <button type="button" onClick={() => insertQuestionFormat('underline')} className="toolbar-button" title="Underline">U</button>
                                <button type="button" onClick={() => insertQuestionFormat('strikethrough')} className="toolbar-button" title="Strikethrough">S</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertQuestionFormat('h1')} className="toolbar-button" title="Heading 1">H1</button>
                                <button type="button" onClick={() => insertQuestionFormat('h2')} className="toolbar-button" title="Heading 2">H2</button>
                                <button type="button" onClick={() => insertQuestionFormat('h3')} className="toolbar-button" title="Heading 3">H3</button>
                                <button type="button" onClick={() => insertQuestionFormat('h4')} className="toolbar-button" title="Heading 4">H4</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertQuestionFormat('ul')} className="toolbar-button" title="Unordered List">• List</button>
                                <button type="button" onClick={() => insertQuestionFormat('ol')} className="toolbar-button" title="Ordered List">1. List</button>
                                <button type="button" onClick={() => insertQuestionFormat('blockquote')} className="toolbar-button" title="Quote">Quote</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertQuestionFormat('code')} className="toolbar-button" title="Inline Code">Code</button>
                                <button type="button" onClick={() => insertQuestionFormat('codeblock')} className="toolbar-button" title="Code Block">Code Block</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertQuestionFormat('link')} className="toolbar-button" title="Link">Link</button>
                                <button type="button" onClick={() => insertQuestionFormat('hr')} className="toolbar-button" title="Horizontal Rule">Line</button>
                                <button type="button" onClick={() => insertQuestionFormat('table')} className="toolbar-button" title="Table">Table</button>
                            </div>
                        </div>
                        
                        {isPreviewMode ? (
                            <div 
                                className="markdown-preview" 
                                dangerouslySetInnerHTML={{ __html: markdownToHtml(question) }}
                            ></div>
                        ) : (
                            <textarea
                                id="question"
                                name="question"
                                required
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                            ></textarea>
                        )}
                        
                        <div className="character-count">
                            Character count: {question.length}
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="editor-header">
                            <label htmlFor="content">Record Details:</label>
                            <div className="preview-toggle">
                                <button 
                                    type="button" 
                                    onClick={() => setIsPreviewMode(!isPreviewMode)} 
                                    className={`toggle-button ${isPreviewMode ? 'active' : ''}`}
                                >
                                    {isPreviewMode ? 'Edit' : 'Preview'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="editor-toolbar">
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertFormat('bold')} className="toolbar-button" title="Bold">B</button>
                                <button type="button" onClick={() => insertFormat('italic')} className="toolbar-button" title="Italic">I</button>
                                <button type="button" onClick={() => insertFormat('underline')} className="toolbar-button" title="Underline">U</button>
                                <button type="button" onClick={() => insertFormat('strikethrough')} className="toolbar-button" title="Strikethrough">S</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertFormat('h1')} className="toolbar-button" title="Heading 1">H1</button>
                                <button type="button" onClick={() => insertFormat('h2')} className="toolbar-button" title="Heading 2">H2</button>
                                <button type="button" onClick={() => insertFormat('h3')} className="toolbar-button" title="Heading 3">H3</button>
                                <button type="button" onClick={() => insertFormat('h4')} className="toolbar-button" title="Heading 4">H4</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertFormat('ul')} className="toolbar-button" title="Unordered List">• List</button>
                                <button type="button" onClick={() => insertFormat('ol')} className="toolbar-button" title="Ordered List">1. List</button>
                                <button type="button" onClick={() => insertFormat('blockquote')} className="toolbar-button" title="Quote">Quote</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertFormat('code')} className="toolbar-button" title="Inline Code">Code</button>
                                <button type="button" onClick={() => insertFormat('codeblock')} className="toolbar-button" title="Code Block">Code Block</button>
                            </div>
                            
                            <div className="toolbar-group">
                                <button type="button" onClick={() => insertFormat('link')} className="toolbar-button" title="Link">Link</button>
                                <button type="button" onClick={() => insertFormat('hr')} className="toolbar-button" title="Horizontal Rule">Line</button>
                                <button type="button" onClick={() => insertFormat('table')} className="toolbar-button" title="Table">Table</button>
                            </div>
                        </div>
                        
                        {isPreviewMode ? (
                            <div 
                                className="markdown-preview" 
                                dangerouslySetInnerHTML={{ __html: markdownToHtml(record_details) }}
                            ></div>
                        ) : (
                            <textarea
                                id="content"
                                name="content"
                                required
                                value={record_details}
                                onChange={(e) => setRecord_Details(e.target.value)}
                            ></textarea>
                        )}
                        
                        <div className="character-count">
                            Character count: {record_details.length}
                        </div>
                    </div>
                </form>
            </div>

            <div className="bottom-actions">
                <button 
                    type="button" 
                    onClick={createMemoRecord}
                    className="submit-button"
                >
                    Submit
                </button>
                
                <button 
                    className="secondary-button" 
                    onClick={goToUpdateSubjectType}
                >
                    Add or Remove Subject Types
                </button>
            </div>

            <style>
                {`
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                    }

                    .header-container {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                    }

                    h2 {
                        margin: 0;
                    }

                    .form-wrap {
                        background-color: #f9f9f9;
                        padding: 2rem;
                        border-radius: 12px;
                        margin-bottom: 20px;
                    }

                    .submit-button {
                        background-color: #007bff;
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    }

                    .submit-button:hover {
                        background-color: #0056b3;
                    }

                    .form-group {
                        margin-bottom: 40px;
                    }

                    label {
                        display: block;
                        margin-bottom: 8px;
                        color: #555;
                        font-weight: 500;
                    }

                    .editor-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }

                    .preview-toggle {
                        margin-left: auto;
                    }

                    .toggle-button {
                        background-color: #f0f0f0;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        padding: 5px 15px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    }

                    .toggle-button:hover {
                        background-color: #e0e0e0;
                    }

                    .toggle-button.active {
                        background-color: #007bff;
                        color: white;
                    }

                    .editor-toolbar {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 8px;
                        margin-bottom: 10px;
                        padding: 8px;
                        background-color: #f0f0f0;
                        border-radius: 8px 8px 0 0;
                        border: 1px solid #ddd;
                        border-bottom: none;
                    }

                    .toolbar-group {
                        display: flex;
                        gap: 2px;
                    }

                    .toolbar-group:not(:last-child)::after {
                        content: '';
                        display: inline-block;
                        width: 1px;
                        background-color: #ddd;
                        margin: 0 4px;
                    }

                    .toolbar-button {
                        background-color: transparent;
                        border: 1px solid transparent;
                        border-radius: 4px;
                        padding: 5px 8px;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s ease;
                    }

                    .toolbar-button:hover {
                        background-color: #e0e0e0;
                        border-color: #ccc;
                    }

                    textarea {
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 0 0 8px 8px;
                        font-size: 16px;
                        box-sizing: border-box;
                        font-family: 'Courier New', Courier, monospace;
                    }

                    textarea#question {
                        min-height: 300px;
                        border-radius: 8px;
                    }

                    textarea#content {
                        min-height: 500px;
                    }

                    .markdown-preview {
                        min-height: 500px;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 0 0 8px 8px;
                        background-color: white;
                        overflow-y: auto;
                    }

                    .markdown-preview h1,
                    .markdown-preview h2,
                    .markdown-preview h3,
                    .markdown-preview h4,
                    .markdown-preview h5 {
                        margin-top: 1.5em;
                        margin-bottom: 0.5em;
                    }

                    .markdown-preview blockquote {
                        border-left: 4px solid #ddd;
                        padding-left: 1em;
                        margin-left: 0;
                        color: #666;
                    }

                    .markdown-preview pre {
                        background-color: #f5f5f5;
                        padding: 1em;
                        border-radius: 4px;
                        overflow-x: auto;
                    }

                    .markdown-preview code {
                        background-color: #f5f5f5;
                        padding: 2px 4px;
                        border-radius: 3px;
                        font-family: 'Courier New', Courier, monospace;
                    }

                    .markdown-preview table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 1em 0;
                    }

                    .markdown-preview th,
                    .markdown-preview td {
                        padding: 8px;
                        border: 1px solid #ddd;
                    }

                    .markdown-preview tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }

                    .character-count {
                        text-align: right;
                        margin-top: 5px;
                        font-size: 14px;
                        color: #666;
                    }

                    select {
                        width: 100%;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        font-size: 16px;
                    }
                    
                    .bottom-actions {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-top: 20px;
                    }

                    .secondary-button {
                        background-color: #e0e0e0;
                        color: #333;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 16px;
                        transition: background-color 0.3s ease;
                    }

                    .secondary-button:hover {
                        background-color: #bdbdbd;
                    }
                `}
            </style>
        </div>
    );
}

export default CreateMemoRecord;