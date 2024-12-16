import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // 导入 useNavigate
import api from "../api";
import "../styles/Home.css";

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
        </div>
    );
}

export default CreateMemoRecord;
