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
                    console.log('Added "Remember" to memo_record id: ' + memo_record.id);
                } else {
                    console.log("Failed to update study status.");
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
                    console.log('Added "Forget" to memo_record id: ' + memo_record.id);
                } else {
                    console.log("Failed to update MemoRecord.");
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

    const deleteNote = (id) => {
        api
            .delete(`/api/memo_records/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("memo_records deleted!   id: " + id);
                else alert("Failed to delete memo_records.");
                getNotes();
            })
            .catch((error) => alert(error));
    };

    return (
        <div className="memo_record-container">
            <form>
                <p>MemoRecord ID: {memo_record.id}</p>
                <p>study_history_id: {memo_record.study_history.id}</p>
                <p>last_updated: 
                    {new Date(memo_record.study_history.last_updated).toLocaleString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
                <label>Content:</label>
                {isEditing ? (
                    <textarea
                        value={updated_record_details}
                        onChange={handleContentChange}
                        onDelete={deleteNote}
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
