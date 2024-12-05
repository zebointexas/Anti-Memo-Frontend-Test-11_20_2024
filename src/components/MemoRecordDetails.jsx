import React, { useState, useEffect } from "react";
import "../styles/Note.css";
import api from "../api";

function MemoRecordDetails({ memo_record, goToNext }) {
    const [isEditing, setIsEditing] = useState(false);
    const [updated_record_details, setUpdatedRecordDetails] = useState(memo_record.record_details);

    useEffect(() => {
        setUpdatedRecordDetails(memo_record.record_details);
    }, [memo_record]);

    const handleContentChange = (e) => {
        setUpdatedRecordDetails(e.target.value);
    };

    const handleDetailsUpdate = () => {
        if (updated_record_details !== memo_record.record_details) {
            api
                .put(`/api/memo_records/update/${memo_record.id}/`, { record_details: updated_record_details })
                .then((res) => {
                    if (res.status === 200) {
                        console.log("Note updated successfully!");
                    } else {
                        console.log("Failed to update note.");
                    }
                })
                .catch((err) => alert(err));
        }
        setIsEditing(false);
    };

    const handleRemember = (e) => {
        e.preventDefault();
        api
            .put(`/api/memo_records/update/${memo_record.id}/`, { record_details: updated_record_details }, {
                headers: { 'Remember-Status': 'Remember' }
            })
            .then((res) => {
                if (res.status === 200) {
                    console.log("Note updated successfully!");
                } else {
                    console.log("Failed to update note.");
                }
            })
            .catch((err) => alert(err));
        goToNext(); 
        setIsEditing(false); 
    };

    const handleForget = (e) => {
        e.preventDefault();
        api
            .put(`/api/memo_records/update/${memo_record.id}/`, { record_details: updated_record_details }, {
                headers: { 'Remember-Status': 'Forget' }
            })
            .then((res) => {
                if (res.status === 200) {
                    console.log("Note updated successfully!");
                } else {
                    console.log("Failed to update note.");
                }
            })
            .catch((err) => alert(err));
        goToNext();
        setIsEditing(false); 
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
                {isEditing ? (
                    <textarea
                        value={updated_record_details}
                        onChange={handleContentChange}
                    />
                ) : (
                    <p>{updated_record_details}</p>
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

export default MemoRecordDetails;
