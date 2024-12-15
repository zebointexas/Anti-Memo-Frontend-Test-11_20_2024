import React, { useState, useEffect, useRef } from "react";
import "../styles/MemoRecordDetails.css";
import api from "../api";

function MemoRecordDetails({ memo_record, goToNext }) {
    const [isEditing, setIsEditing] = useState(false);
    const [updated_record_details, setUpdatedRecordDetails] = useState(memo_record.record_details);
    const [showContent, setShowContent] = useState(false);
    const [timer, setTimer] = useState(0); // 正计时的状态
    const timerRef = useRef(null); // 保存计时器引用

    useEffect(() => {
        setUpdatedRecordDetails(memo_record.record_details);
    }, [memo_record]);

    useEffect(() => {
        // 页面加载时启动正计时
        timerRef.current = setInterval(() => {
            setTimer((prev) => prev + 1); // 每秒递增
        }, 1000);

        return () => clearInterval(timerRef.current); // 组件卸载时清除计时器
    }, []);

    const resetTimer = () => {
        setTimer(0); // 重置为0秒
    };

    // 格式化计时器为 MM:SS
    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleContentChange = (e) => {
        setUpdatedRecordDetails(e.target.value);
    };

    const handleDetailsUpdate = () => {
        if (updated_record_details !== memo_record.record_details) {
            api
                .put(`/api/memo_records/update/record-details/${memo_record.id}/`, { record_details: updated_record_details })
                .then((res) => {
                    if (res.status === 200) {
                        console.log("MemoRecord details was updated successfully!");
                    } else {
                        console.log("Failed to update MemoRecord details.");
                    }
                })
                .catch((err) => alert(err));
        }
        setIsEditing(false);
    };

    const handleStudyStatusUpdate = (study_status) => (e) => {
        e.preventDefault();
        resetTimer(); // 重置计时器
        api
            .put(`/api/memo_records/update/study-history/${memo_record.id}/`, { study_status })
            .then((res) => {
                if (res.status === 200) {
                    console.log(`Added \"${study_status}\" to memo_record id: ${memo_record.id}`);
                } else {
                    console.log(`Failed to update study status to \"${study_status}\".`);
                }
            })
            .catch((err) => alert(err));
        goToNext();
        setShowContent(false);
        setIsEditing(false);
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleDetailsUpdate();
        } else {
            setIsEditing(true);
            setShowContent(true);  // Show the content when editing starts
        }
    };

    const deleteMemoRecord = (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            api
                .delete(`/api/memo_records/delete/${id}/`)
                .then((res) => {
                    if (res.status === 204) {
                        goToNext();
                    } else {
                        alert("Failed to delete MemoRecord.");
                    }
                })
                .catch((error) => alert(error));
        }
    };

    return (
        <div className="memo-record-wrapper">
            <div className="memo_record-container">
                <div className="content-and-buttons">
                    <form className="memo-record-form">
                        <p>
                            <span className="question-text">{memo_record.question}</span>
                        </p>

                        {showContent ? (
                            isEditing ? (
                                <textarea
                                    value={updated_record_details}
                                    onChange={handleContentChange}
                                />
                            ) : (
                                <p className="display-answer-text">{updated_record_details}</p>
                            )
                        ) : (
                            <button type="display-answer-button" onClick={() => setShowContent(true)}>
                                Display the Answer
                            </button>
                        )}

                        <div className="record-meta-info">
                            <p>MemoRecord ID: {memo_record.id}</p>
                            <p>Study History ID: {memo_record.study_history_id.id}</p>
                            <p>Last Study Time:&nbsp;&nbsp;&nbsp;
                                {new Date(memo_record.study_history_id.last_updated).toLocaleString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                            <p>Last Study Date:&nbsp;&nbsp;&nbsp;
                                {new Date(memo_record.study_history_id.last_updated).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                })}
                            </p>
                        </div>
                    </form>

                    <div className="button-container">
                        <div className="timer-info">
                            <p>{formatTimer(timer)}</p>
                        </div>
                        <button type="button" onClick={handleStudyStatusUpdate('Remember')}>
                            Remember
                        </button>
                        <button type="button" onClick={handleStudyStatusUpdate('Forget')}>
                            Forget
                        </button>
                        <button type="button" onClick={handleEditToggle}>
                            {isEditing ? 'Save' : 'Edit'}
                        </button>
                        <button
                            type="button"
                            onClick={() => deleteMemoRecord(memo_record.id)}
                            className="delete-button"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MemoRecordDetails;
