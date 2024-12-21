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
            <div><h2>Create a Memo Record</h2></div>
            <br />
            <br />
            <div>
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
            </div>

            
            <br />
            <br />
            <br />
            <br /> 

            <div>
                <button className="AddOrDeleteSubjectType" onClick={goToUpdateSubjectType}>Add or delete a subject type</button>
            </div>

            <style>
            {`
                form {
                    background-color: #f9f9f9;
                    padding: 2rem;
                    border-radius: 12px;
                    max-width: 1200px;
                    margin: auto;
                    font-family: 'Arial', sans-serif;
                    display: flex;
                    flex-direction: column;
                    gap: 20px; /* 控制每个表单项的间距 */
                }

                form h2 {
                    color: #333;
                    font-size: 28px;
                    margin-bottom: 20px;
                    text-align: center;
                    font-weight: 600;
                }

                form .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                form label {
                    color: #555;
                    font-size: 16px;
                    font-weight: 500;
                }

                form textarea {
                    width: 98%;
                    padding: 12px 12px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    resize: vertical;
                }

                form select {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    font-size: 16px;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }

                form textarea#content {
                    min-height: 800px; /* 适合 Record Details */
                }

                form textarea#question {
                    height: 100px; /* 问题部分的高度 */
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

                button {
                    background-color: #e0e0e0; /* 浅灰色 */
                    color: #333333; /* 深灰色文字 */
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                    display: inline-block; /* 改为 inline-block 便于右对齐 */
                    margin: 20px 0;
                    float: right; /* 靠右对齐 */
                }

                button:hover {
                    background-color: #bdbdbd; /* 鼠标悬停时的稍深灰色 */
                }

            `}
        </style>

        </div>        
    );
}

export default CreateMemoRecord;
