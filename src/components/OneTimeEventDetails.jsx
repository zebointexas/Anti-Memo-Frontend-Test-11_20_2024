import React, { useState } from "react";
import { CSSTransition } from "react-transition-group"; // 导入 CSSTransition

function OneTimeEventDetails({ one_time_event_details, onDelete, onDone, onUpdateEventDetails, onPostpone }) {
    const [showDetails, setShowDetails] = useState(false); // 控制是否显示事件详情，初始值为 false
    const [isDone, setIsDone] = useState(one_time_event_details.is_done); // 用于记录事件是否已完成
    const [isEditing, setIsEditing] = useState(false); // 控制是否进入编辑状态
    const [updatedDetails, setUpdatedDetails] = useState(one_time_event_details.event_details); // 存储编辑后的详情内容

    if (!one_time_event_details) {
        return <p>No event details available.</p>;
    }

    const formattedCreatedAt = new Date(one_time_event_details.created_at).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric" }
    );
    const formattedStartDate = new Date(one_time_event_details.start_date).toLocaleString(
        "en-US",
        {month: "short", day: "numeric"}
    );

    const renderDetailsWithLinks = (text) => {
        // 正则表达式匹配链接（HTTP/HTTPS）
        const urlRegex = /(https?:\/\/[^\s]+)/g;
    
        // 将匹配的链接替换为超链接
        const convertedText = text.replace(
            urlRegex,
            (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
        );
    
        return { __html: convertedText }; // 返回 HTML 格式
    };

    const handleDone = () => {
        console.log("Marking as done..."); // 调试信息
        onDone(one_time_event_details.id, true); // 调用父组件的 onDone
        setIsDone(true); // 更新状态为已完成
    };

    const handleSaveEdit = () => {
        // 这里可以调用API或者其他方式保存更新的内容
        onUpdateEventDetails(one_time_event_details.id, updatedDetails);
        setIsEditing(false); // 退出编辑模式
    };

    const handleEditChange = (e) => {
        setUpdatedDetails(e.target.value); // 更新编辑内容
    };

    const handlePostpone = () => {
        const newStartDate = new Date(one_time_event_details.start_date);

        //         const formattedStartDate = startDate.includes("T")
        // ? new Date(startDate).toISOString() // 如果已有时间部分，转为标准 ISO 时间
        // : new Date(`${startDate}T00:00:00`).toISOString().replace("Z", ""); // 去掉 "Z"，以保留本地时区

        newStartDate.setDate(newStartDate.getDate() + 3); // 将事件推迟3天

        const localDate = newStartDate.toISOString().slice(0, 19);

        onPostpone(one_time_event_details.id, localDate); // 调用父组件的 onPostpone
    };
 
    // 高亮样式（当事件是 high importance 时）
    const cardStyle = one_time_event_details.is_high_importance
        ? { border: "2px solid #FF6347", backgroundColor: "#FFF8E1" } // 高亮的样式
        : {};

    return (
        <>
            <style>
                {`
                    .card {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                        padding: 16px;
                        margin: 16px auto;
                        background-color: #fff;
                        max-width: 700px;
                        width: 100%;
                        position: relative;
                    }

                    .card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                    }

                    .fade-enter {
                        opacity: 0;
                    }
                    .fade-enter-active {
                        opacity: 1;
                        transition: opacity 0.5s;
                    }
                    .fade-exit {
                        opacity: 1;
                    }
                    .fade-exit-active {
                        opacity: 0;
                        transition: opacity 0.5s;
                    }

                    .title {
                        font-size: 18px;
                        margin-bottom: 8px;
                        color: #333;
                    }

                    .delete-button, .toggle-button, .done-button, .save-button, .postpone-button {
                        background-color: #4CAF50;
                        color: #fff;
                        border: none;
                        border-radius: 4px;
                        padding: 8px 12px;
                        cursor: pointer;
                        font-size: 14px;
                        margin-left: 8px;
                        transition: background-color 0.3s;
                    }

                    .delete-button {
                        background-color: #f44336;
                    }

                    .toggle-button {
                        background-color: #2196f3;
                    }

                    .done-button {
                        background-color: #4CAF50;
                    }

                    .save-button {
                        background-color: #FF9800;
                    }

                    .done-button:disabled {
                        background-color: #9e9e9e;
                    }

                    .detail, .meta, .history {
                        font-size: 14px;
                        margin: 4px 0;
                        color: #555;
                    }

                    .meta {
                        font-size: 12px;
                        margin: 8px 0;
                        color: #888;
                    }

                    .history {
                        margin-top: 4px;
                    }

                    .edit-textarea {
                        width: 100%;
                        min-height: 800px;
                        min-width: 1000px;
                        padding: 10px;
                        font-size: 14px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        margin-top: 10px;
                        resize: both;
                    }
 
                    /* 固定按钮样式 */
                    .scroll-to-bottom-button {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: fixed;
                        top: 80px; /* 调整按钮距离顶部的距离 */
                        right: 80px; /* 保持按钮距离右侧的距离 */
                        background-color: #2196f3;
                        color: white;
                        padding: 22px 40px;
                        border-radius: 50%;
                        border: none;
                        cursor: pointer;
                        font-size: 50px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    }

                    .postpone-button {
                        background-color: #FF5722; /* 推迟按钮颜色 */
                    }

                    .pre-wrap-text {
                        white-space: pre-wrap;
                    }

                `}
            </style>

            <CSSTransition
                in={!isDone} // 控制显示和消失的动画
                timeout={500} // 动画持续时间
                classNames="fade" // 动画类名前缀
                unmountOnExit // 事件完成后卸载组件
            >
                <div className="card" style={cardStyle}> {/* 应用高亮样式 */}
                    <div className="card-header">
                        <h3 className="title">{one_time_event_details.event_name} <span> &nbsp; | &nbsp;  {formattedStartDate}</span></h3>
                        <div>
                            <button
                                className="postpone-button"
                                onClick={handlePostpone}
                                disabled={isDone} // 如果事件已经完成，按钮禁用
                            >
                                Postpone
                            </button>

                            <button
                                className="toggle-button"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                {showDetails ? "Less" : "More"}
                            </button>

                            <button
                                className="done-button"
                                onClick={handleDone}
                                disabled={isDone} // 如果事件已经完成，按钮禁用
                            >
                                {isDone ? "Already Done" : "Done"}
                            </button>
                        </div>
                    </div>
                    {showDetails && (
                        <div>
                            {isEditing ? (
                                <div>
                                    <textarea
                                        className="edit-textarea"
                                        value={updatedDetails}
                                        onChange={handleEditChange}
                                    />
                                    <button className="save-button" onClick={handleSaveEdit}>
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <p className="pre-wrap-text" >
                                    <span dangerouslySetInnerHTML={renderDetailsWithLinks(updatedDetails)} />                                    
                                </p>
                            )}
                            {/* <p className="detail"><strong>Due: </strong> {formattedStartDate}</p> */}
                            {/* <p className="history"><strong>History:</strong> {one_time_event_details.event_history}</p>                         */}
                            {/* <p className="meta"><strong>Created At:</strong> {formattedCreatedAt}</p> */}
                            {!isEditing && (
                                <button className="save-button" onClick={() => setIsEditing(true)}>
                                    Edit Details
                                </button>
                            )}
                            <button
                                className="delete-button"
                                onClick={() => {
                                    const confirmDelete = window.confirm(
                                        `Are you sure you want to delete "${one_time_event_details.event_name}?"`
                                    );
                                    if (confirmDelete) {
                                        onDelete(one_time_event_details.id); // 调用父组件的删除方法
                                    }
                                }}
                            >
                                Delete
                            </button>    
                        </div>
                    )}
                </div>
            </CSSTransition>

            {/* 固定按钮，点击时滚动到页面底部 */}
            {/* <button className="scroll-to-bottom-button" onClick={scrollToBottom}>
                ↓
            </button> */}
        </>
    );
}

export default OneTimeEventDetails;
