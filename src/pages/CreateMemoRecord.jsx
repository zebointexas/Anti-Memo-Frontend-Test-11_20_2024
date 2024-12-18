import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // 导入 useNavigate
import api from "../api";

function CreateMemoRecord() {
    const [record_details, setRecord_Details] = useState("");
    const [question, setQuestion] = useState(""); // 新增用于存储“question”的状态
    const [subjectTypes, setSubjectTypes] = useState([]);  // 用于存储从后端获取的科目类型
    const [subject_type, setSelectedSubjectType] = useState("BQ"); // 默认选择 "BQ"
    const navigate = useNavigate();  // 获取 navigate 函数

    // 在组件加载时请求科目类型
    useEffect(() => {
        api.get("/api/subject_types_list/")  // 假设后端 API 返回所有科目类型
            .then((res) => {
                if (res.status === 200) {
                    setSubjectTypes(res.data); // 更新科目类型列表
                } else {
                    console.log("Failed to fetch subject types.");
                }
            })
            .catch((err) => alert(err));
    }, []);

    // 提交表单
    const createMemoRecord = (e) => {
        e.preventDefault();
        if (!subject_type) {
            alert("Please select a subject type!");
            return;
        }

        console.log(record_details);
        console.log(question);
        console.log(subject_type);

        api
            .post("/api/memo_records/create/", { 
                record_details, 
                question, // 添加 question 字段
                subject_type
            })
            .then((res) => {
                if (res.status === 201) {
                    console.log("MemoRecord was created!");
                    alert("MemoRecord was created!");
                } else {
                    console.log("Failed to create MemoRecord.");
                }
            })
            .catch((err) => alert(err));
    };

    // 跳转到更新科目类型页面
    const goToUpdateSubjectType = () => {
        navigate("/update-subject-type");  // 跳转到指定页面
    };

    return (
        <div>
            <h2>Create a Memo Record</h2>
            <form onSubmit={createMemoRecord}>

                <label htmlFor="question">Question:</label>
                <br />
                <textarea
                    id="question"
                    name="question"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                ></textarea>
                <br />

                <label htmlFor="content">Record Details:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={record_details}
                    onChange={(e) => setRecord_Details(e.target.value)}
                ></textarea>
                <br />

                <label htmlFor="subject-type">Subject Type:</label>
                <select
                    id="subject-type"
                    name="subject_type"
                    value={subject_type}
                    onChange={(e) => setSelectedSubjectType(e.target.value)}
                    required
                >
                    <option value="">Select a Subject</option>
                    {subjectTypes.map((subject) => (
                        <option key={subject.id} value={subject.type}>
                            {subject.type}
                        </option>
                    ))}
                </select>
                <br />

                <input type="submit" value="Submit" />
            </form>

            {/* 跳转到更新科目类型页面的按钮 */}
            <button onClick={goToUpdateSubjectType}>Add or delete a subject type</button>


            <style>
                {`
                    /* 样式优化：表单部分 */
                    form {
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        margin: auto;
                        font-family: 'Arial', sans-serif;
                    }

                    form h2 {
                        color: #333;
                        font-size: 28px;
                        margin-bottom: 20px;
                        text-align: center;
                        font-weight: 600;
                    }

                    form label {
                        color: #555;
                        font-size: 16px;
                        font-weight: 500;
                        margin-top: 12px;
                    }

                    form input,
                    form textarea {
                        width: 100%;
                        padding: 12px 16px;
                        margin: 8px 0 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        box-sizing: border-box;
                        font-size: 16px;
                        transition: all 0.3s ease;
                    }

                    /* 特别针对 question 和 record details 输入框，增加高度和宽度 */                    
                    form textarea {
                        height: 50px; /* 增加高度 */
                    }

                    form textarea {
                        height: 150px; /* 更高的文本区域 */
                    }

                    /* 聚焦效果 */
                    form input:focus,
                    form textarea:focus {
                        border-color: #007bff;
                        box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
                    }

                    form input[type="submit"] {
                        background-color: #007bff;
                        color: white;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 18px;
                        font-weight: 600;
                        transition: background-color 0.3s ease;
                    }

                    form input[type="submit"]:hover {
                        background-color: #0056b3;
                    }

                    form input[type="submit"]:active {
                        background-color: #004085;
                    }

                    /* 响应式：小屏幕调整 */
                    @media (max-width: 600px) {
                        form {
                            padding: 20px;
                        }

                        form h2 {
                            font-size: 24px;
                        }

                        form input,
                        form textarea {
                            padding: 10px;
                        }

                        form input[type="submit"] {
                            font-size: 16px;
                            padding: 10px 20px;
                        }
                    }
                `}
            </style>

        </div>        
    );
}

export default CreateMemoRecord;
