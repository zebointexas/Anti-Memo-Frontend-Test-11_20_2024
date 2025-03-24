import React, { useState, useEffect, useRef } from "react";
import api from "../api";

function MemoRecordDetails({ memo_record, goToNext }) {

    const [isEditing, setIsEditing] = useState(false);
    const [updated_record_details, setUpdatedRecordDetails] = useState(memo_record.record_details);
    const [updated_record_question, setUpdatedRecordQuestion] = useState(memo_record.question);
    const [showContent, setShowContent] = useState(false);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);
    const textareaRef = useRef(null); 

    useEffect(() => {
        setUpdatedRecordDetails(memo_record.record_details);
        setUpdatedRecordQuestion(memo_record.question);
    }, [memo_record]);


    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        // 当 isEditing 为 true 时，调整 textarea 的高度
        if (isEditing && textareaRef.current) {
            adjustTextareaHeight();
        }
    }, [isEditing, updated_record_details]);

    const resetTimer = () => {
        setTimer(0);
    };

    const formatTimer = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleContentChange = (e) => {
        setUpdatedRecordDetails(e.target.value);
    };

    const handleQuestionChange = (e) => {
        setUpdatedRecordQuestion(e.target.value);
    };

    // 动态调整 textarea 高度
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // 重置高度
            textarea.style.height = `${textarea.scrollHeight}px`; // 设置为 scrollHeight（内容的高度）
        }
    };
 
    const handleRecordUpdate = () => {
        // 如果任何字段有更新，发送 PUT 请求
        const updatedData = {};
    
        if (updated_record_details !== memo_record.record_details) {
            updatedData.record_details = updated_record_details;
        }
    
        if (updated_record_question !== memo_record.question) {
            updatedData.question = updated_record_question;
        }
    
        // 如果有字段需要更新
        if (Object.keys(updatedData).length > 0) {
            api
                .put(`/api/memo_records/update/${memo_record.id}/`, updatedData)
                .then((res) => {
                    if (res.status === 200) {
                        console.log("MemoRecord details and/or question updated successfully!");
                    } else {
                        console.log("Failed to update MemoRecord details and/or question.");
                    }
                })
                .catch((err) => alert(err));
        }
    
        setIsEditing(false);
    };
 
    const handleStudyStatusUpdate = (study_status) => (e) => {
        e.preventDefault();
        resetTimer();
        setShowContent(false);
        setIsEditing(false);
        api
            .put(`/api/memo_records/update/study-history/${memo_record.id}/`, { study_status })
            .then((res) => {
                if (res.status === 200) {
                    console.log(`Added "${study_status}" to memo_record id: ${memo_record.id}`);
                } else {
                    console.log(`Failed to update study status to "${study_status}".`);
                }
            })
            .catch((err) => alert(err));        
        setShowContent(false);
        setIsEditing(false);
        goToNext();
    };

    const handleEditToggle = () => {
        if (isEditing) {
            handleRecordUpdate();
        } else {
            setIsEditing(true);
            setShowContent(true);
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

    const resetStudyPlan = (id) => {
        if (window.confirm("Are you sure you want to reset this study plan?")) {
            api
                .put(`/api/study_plan/reset/${id}/`)
                .then((res) => {
                    if (res.status === 200) {                    
                    } else {
                        alert("Failed to reset study plan.");
                    }
                })
                .catch((error) => alert(error));
        }
    };

    // 显示文本中的超链接
    const renderTextWithLinks = (text) => {
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        return text.split(urlPattern).map((part, index) => {
            // 如果该部分匹配到 URL，渲染为 a 标签
            if (part.match(urlPattern)) {
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer">
                        {part}
                    </a>
                );
            }
            return part; // 否则直接显示普通文本
        });
    };

    return (
        <>
            <style>
                {`
                    .memo_record-container {
                        display: flex;
                        width: 100%;
                        justify-content: flex-start;
                        align-items: flex-start;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        padding: 10px;
                        background-color: #f9f9f9;
                        margin: 10px 0;
                        width: 80%;
                        margin-left: auto;
                        margin-right: auto;
                        box-sizing: border-box;
                    }

                    .content-section {
                        flex-grow: 1;
                        overflow: hidden;
                        padding-right: 10px;
                        box-sizing: border-box;
                    }

                    .button-container {
                        flex: 0;
                        width: auto;
                        min-width: 120px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        margin-left: 5px;
                        box-sizing: border-box;
                    }

                    .button-container button {
                        margin: 5px 0;
                        padding: 12px 20px;
                        font-size: 16px;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        width: 100%;
                        min-width: 20px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }

                    .delete-button {
                        background-color: #ff6b6b;
                        color: #fff;
                    }

                    .remember-button {
                        background-color: #6bcf63;
                        color: #fff;
                    }

                    .forget-button {
                        background-color: #f0ad4e;
                        color: #fff;
                    }

                    .edit-button {
                        background-color: #5bc0de;
                        color: #fff;
                    }

                    #reset-study-plan-button {

                        align-self: flex-end; /* 将按钮放置到容器底部 */
                        background-color: rgba(18, 20, 31, 0.37);
                        font-size: 8px;
                        margin-top: 200px; /* 将按钮推到最底部 */
                        width: 50%;
                        color: #fff;

                        display: flex;
                        flex-direction: column;
                        justify-content: space-between; /* 上下分布按钮 */
                        height: 100%; /* 确保容器高度撑满父元素 */   
                    }

                    #display_button {
                        background-color: #4caf50;
                        color: white;
                        font-weight: bold;
                        transition: background-color 0.3s ease, transform 0.3s ease;
                        border-radius: 8px;
                        width: 100%;
                        padding: 18px 20px;
                        font-size: 18px;
                    }

                    #hide_button {
                        background-color: #f44336; /* 修改为红色 */
                        color: white;
                        font-weight: bold;
                        transition: background-color 0.3s ease, transform 0.3s ease;
                        border-radius: 8px;
                        width: 100%;
                        padding: 18px 20px;
                        font-size: 18px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
                        border: 2px solid #d32f2f; /* 添加边框，使按钮更醒目 */
                    }

                    .question-text {
                        white-space: pre-wrap; /* 保证文本换行，保留换行符 */
                        word-wrap: break-word; /* 保证长单词自动换行 */
                        height: auto; /* 高度根据内容自动调整 */                        
                    }

                    /* 为显示答案的区域添加样式 */
                    
                    .answer-text {
                        white-space: pre-wrap; /* 保证文本换行，保留换行符 */
                        word-wrap: break-word; /* 保证长单词自动换行 */
                        overflow-wrap: break-word; /* 确保长单词换行，不会溢出 */                        
                        padding: 15px; /* 增加内边距，确保文本与边框之间有空隙 */
                        border: 2px solid #ddd; /* 给文本区域添加边框 */
                        border-radius: 8px; /* 圆角效果 */
                        background-color:rgb(249, 249, 249); /* 设置背景颜色 */
                        margin-top: 10px; /* 给顶部增加间距 */
                        font-size: 16px; /* 调整字体大小，使其更易读 */
                        box-sizing: border-box; /* 确保边框和内边距不影响宽度计算 */
                        fontFamily: "Courier, monospace"
                    }


                    textarea {
                        width: 100%;
                        min-height: 50px;
                        padding: 5px;
                        box-sizing: border-box;
                        resize: vertical; /* 允许垂直方向调整大小 */
                    }

                    /* 为 reference 信息设置样式 */
                    .reference-info {
                        font-size: 14px; /* 设置较小的字体 */
                        color: #888; /* 使用灰色字体，让信息不那么显眼 */
                        margin-top: 10px; /* 给每一项之间增加一点间距 */
                    }

                    .reference-info p {
                        margin: 5px 0; /* 每项信息之间增加小间距 */
                    }
                `}
            </style>

            <div className="memo_record-container">
                <div className="content-section">
                    <form>
                        <p>
                            {isEditing ? (
                                <textarea
                                    ref={textareaRef}
                                    value={updated_record_question}  // 使用 updated_question 作为值
                                    onChange={handleQuestionChange}  // 处理问题文本的改变
                                    wrap="soft"
                                />
                            ) : (
                                <span className="question-text">{renderTextWithLinks(updated_record_question)}</span>
                            )}
                        </p>
                        {showContent ? (
                            isEditing ? (
                                <textarea
                                    ref={textareaRef}
                                    value={updated_record_details}
                                    onChange={handleContentChange}
                                    wrap="soft"
                                />
                            ) : (
                                <p className="answer-text">
                                    {renderTextWithLinks(updated_record_details)}
                                    <br /> 
                                    <br />
                                    <button id="hide_button" type="button" onClick={() => setShowContent(false)}>
                                    Hide Answer
                                    </button>
                                </p>                                
                            )
                        ) : (
                            <button id="display_button" type="button" onClick={() => setShowContent(true)}>
                                Display Answer
                            </button>
                        )}

                    <div className="reference-info">
                        <p>ID: {memo_record.id}</p>
                        {/* <p>Study History ID: {memo_record.study_history_id.id}</p> */}
                        {/* <p>
                            Last Study Time:&nbsp;&nbsp;&nbsp;
                            {new Date(memo_record.study_history_id.last_updated).toLocaleString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p> */}
                        <p>
                            Last Study Date:&nbsp;&nbsp;
                            {new Date(memo_record.study_history_id.last_updated).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </p>
                    </div>

                    </form>
                </div>

                <div className="button-container">
                    <div className="timer-info">
                        <p>{formatTimer(timer)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleStudyStatusUpdate("Remember")}
                        className="remember-button"
                    >
                        Remember
                    </button>
                    <button
                        type="button"
                        onClick={handleStudyStatusUpdate("Forget")}
                        className="forget-button"
                    >
                        Forget
                    </button>
                    <button
                        type="button"
                        onClick={handleEditToggle}
                        className="edit-button"
                    >
                        {isEditing ? "Save" : "Edit"}
                    </button>
                    <button
                        type="button"
                        onClick={() => deleteMemoRecord(memo_record.id)}
                        className="delete-button"
                    >
                        Delete
                    </button>

                    <button
                        id="reset-study-plan-button"
                        type="button"
                        onClick={() => resetStudyPlan(memo_record.id)}
                        className="reset-study-plan-button"
                    >
                        Reset
                    </button>
                </div>
            </div>
        </>
    );
}

export default MemoRecordDetails;
