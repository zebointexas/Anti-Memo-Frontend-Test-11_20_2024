import { useState, useEffect } from "react";
import React from "react";
import "../styles/Note.css"
import api from "../api";
import "../styles/Home.css"

function MemoRecordDetails({ memo_record, onDelete, onUpdate }) {
 
    const [isEditing, setIsEditing] = useState(false);
    const [updated_Record_Details, setUpdatedRecordDetails] = useState(memo_record.record_Details);

    useEffect(() => {
        setUpdatedRecordDetails(memo_record.record_Details);
    }, [memo_record]);

    // 处理内容更新
    const handleContentChange = (e) => {
        setUpdatedRecordDetails(e.target.value);
    };

    const handleDetailsUpdate = (e) => {
        if (updated_Record_Details !== memo_record.record_Details) {
            updateMemoRecordDetails(memo_record.id, { record_Details: updated_Record_Details });
        }

        setIsEditing(false);
    }

    const handleRemember = (e) => {
        
        e.preventDefault();

        api
        .put(`/api/memo_records/update/${memo_record.id}/`, {
            record_Details: updated_Record_Details
        }, {
            headers: {
                'Remember-Status': 'Remember'   
            }
        })
        .then((res) => {
            if (res.status === 200) {
                console.log("Note updated successfully!");
            } else {
                console.log("Failed to update note.");
            }
        })
        .catch((err) => alert(err));
    };

    const handleForget = (e) => {

        e.preventDefault();

        api
        .put(`/api/memo_records/update/${memo_record.id}/`, {
            record_Details: updated_Record_Details
        }, {
            headers: {
                'Remember-Status': 'Forget'   
            }
        })
        .then((res) => {
            if (res.status === 200) {
                console.log("Note updated successfully!");
            } else {
                console.log("Failed to update note.");
            }
        })
        .catch((err) => alert(err));
    };

    const updateMemoRecordDetails = (e) => {
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

    const handleEdit = () => {
        setIsEditing(true);
      };

    const handleEditToggle = () => {
        if (isEditing) {
            handleDetailsUpdate();
        } else {            
            setIsEditing(true);
        }
    };  

    return (
        <div className="memo_record-container">
          <form>
            <p>ID: {memo_record.id}</p> 
            <label>Content:</label>
            
            {/* 如果是编辑模式，显示 textarea 否则显示内容 */}
            {isEditing ? (
              <textarea
                value={updated_Record_Details}
                onChange={handleContentChange}
              />
            ) : (
              <p>{updated_Record_Details}</p>  // 显示内容而不是编辑框
            )}
            
            <br />
             
            <button onClick={handleRemember}>Remember</button>
            <button onClick={handleForget}>Forget</button> 
            <button type="button" onClick={handleEditToggle}>
                 {isEditing ? 'Save' : 'Edit'}
            </button>    
          </form>
        </div>
    );
}

export default MemoRecordDetails