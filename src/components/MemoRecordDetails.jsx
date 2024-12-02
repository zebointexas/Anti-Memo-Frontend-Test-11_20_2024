import { useState, useEffect } from "react";
import React from "react";
import "../styles/Note.css"
import api from "../api";
import "../styles/Home.css"

function MemoRecordDetails({ memo_record, onDelete, onUpdate }) {
 
    // 初始化状态为 memo_record 中的 record_Details
    const [updated_Record_Details, setUpdatedContent] = useState(memo_record.record_Details);

    useEffect(() => {
        // 当 memo_record 更新时，重新设置状态
        setUpdatedContent(memo_record.record_Details);
    }, [memo_record]);

    // 处理内容更新
    const handleContentChange = (e) => {
        setUpdatedContent(e.target.value);
    };

    // 提交更新
    const handleSubmitUpdate = (e) => {
        e.preventDefault();
        // 调用父组件传递的 onUpdate 函数来提交更新
        if (updated_Record_Details !== memo_record.record_Details) {
            updateMemoRecord(memo_record.id, { record_Details: updated_Record_Details });
        }
    };

    const updateMemoRecord = (e) => {
        api
            .put(`/api/memo_records/update/${memo_record.id}/`, { record_Details: updated_Record_Details}) // Use PUT instead of POST
            .then((res) => {
                if (res.status === 200) {
                    console.log("Note updated successfully!");
                } else {
                    console.log("Failed to update note.");
                }
            })
            .catch((err) => alert(err));
    };

    return (
        <div className="memo_record-container">
            <form onSubmit={handleSubmitUpdate}>
 
                <label htmlFor="updatedContent">Content:</label>
                <textarea
                    id="updatedContent"
                    value={updated_Record_Details}
                    onChange={handleContentChange}
                />
                <br />
 
                <p>ID: {memo_record.id}</p>
        
                <button type="submit">Save Changes</button>
       
                <button type="button" onClick={() => onDelete(memo_record.id)}>
                    Delete
                </button>
            </form>
        </div>
    );
}

export default MemoRecordDetails