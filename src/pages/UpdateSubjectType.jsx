import { useState, useEffect } from "react";
import api from "../api";

function UpdateSubjectType() {
    const [record_details, setRecord_Details] = useState("");
    const [subjectTypes, setSubjectTypes] = useState([]);  // 用于存储从后端获取的科目类型
    const [subject_type, setSelectedSubjectType] = useState(""); // 用于存储用户选择的科目类型
    const [newSubjectName, setNewSubjectName] = useState(""); // 用于存储添加的科目名称

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
 
    const addSubjectType = (e) => {
        e.preventDefault();
        if (!newSubjectName) {
            alert("Please enter a subject name!");
            return;
        }

        api
            .post("/api/subject_types/create/", { type: newSubjectName })
            .then((res) => {
                if (res.status === 201) {
                    setSubjectTypes((prevTypes) => [...prevTypes, res.data]);
                    setNewSubjectName("");
                    console.log("Subject type added!");
                } else {
                    console.log("Failed to add subject type.");
                }
            })
            .catch((err) => {
                console.error("Error:", err.response.data);
            });
    };

    const deleteSubjectType = (id) => {
        api
            .delete(`/api/subject_types/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) {
                    setSubjectTypes(subjectTypes.filter(subject => subject.id !== id)); // 更新科目类型列表
                    console.log("Subject type deleted!");
                } else {
                    console.log("Failed to delete subject type.");
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <div>
            <h3>Add a New Subject Type</h3>
            <form onSubmit={addSubjectType}>
                <label htmlFor="new-subject-name">New Subject Name:</label>
                <input
                    id="new-subject-name"
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    required
                />
                <button type="submit">Add Subject</button>
            </form>

            <h3>Existing Subject Types</h3>
            <ul>
                {subjectTypes.map((subject) => (
                    <li key={subject.id}>
                        {subject.type}{" "}
                        <button onClick={() => deleteSubjectType(subject.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UpdateSubjectType;
