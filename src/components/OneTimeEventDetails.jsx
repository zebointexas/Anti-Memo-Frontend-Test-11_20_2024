import React, { useState } from "react";
import { CSSTransition } from "react-transition-group"; // 导入 CSSTransition

function OneTimeEventDetails({ one_time_event_details, onDelete, onDone }) {
    const [showDetails, setShowDetails] = useState(false); // 控制是否显示事件详情，初始值为 false
    const [isDone, setIsDone] = useState(one_time_event_details.is_done); // 用于记录事件是否已完成

    if (!one_time_event_details) {
        return <p>No event details available.</p>;
    }

    const formattedCreatedAt = new Date(one_time_event_details.created_at).toLocaleDateString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric" }
    );
    const formattedStartDate = new Date(one_time_event_details.start_date).toLocaleString(
        "en-US",
        { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    );

    // 调试：检查按钮点击后是否正确更新状态
    const handleDone = () => {
        console.log("Marking as done..."); // 调试信息
        onDone(one_time_event_details.id); // 调用父组件的 onDone
        setIsDone(true); // 更新状态为已完成
    };

    // 滚动到页面底部
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "auto", // 平滑滚动
        });
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
                        max-width: 500px;
                        width: 100%;
                        position: relative;
                    }

                    .card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        width: 100%;
                    }

                    /* 动画样式 */
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

                    .delete-button, .toggle-button, .done-button {
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

                    /* 固定按钮样式 */
                    .scroll-to-bottom-button {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: fixed;
                        bottom: 100px;
                        right: 100px;
                        background-color: #2196f3;
                        color: white;
                        padding: 22px 40px;
                        border-radius: 50%;
                        border: none;
                        cursor: pointer;
                        font-size: 50px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
                        <h3 className="title">{one_time_event_details.event_name}</h3>
                        <div>
                            <button
                                className="delete-button"
                                onClick={() => onDelete(one_time_event_details.id)}
                            >
                                Delete
                            </button>
                            <button
                                className="toggle-button"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                {showDetails ? "Hide Details" : "Show Details"}
                            </button>
                            <button
                                className="done-button"
                                onClick={handleDone}
                                disabled={isDone} // 如果事件已经完成，按钮禁用
                            >
                                {isDone ? "Done" : "Mark as Done"}
                            </button>
                        </div>
                    </div>
                    {showDetails && (
                        <div>
                            <p className="detail"><strong>Details:</strong> {one_time_event_details.event_details}</p>
                            <p className="detail"><strong>Start Date:</strong> {formattedStartDate}</p>
                            <p className="history"><strong>History:</strong> {one_time_event_details.event_history}</p>
                            <p className="history"><strong>High Importance:</strong> {one_time_event_details.is_high_importance}</p>
                            <p className="meta"><strong>Created At:</strong> {formattedCreatedAt}</p>
                            
                        </div>
                    )}
                </div>
            </CSSTransition>

            {/* 固定按钮，点击时滚动到页面底部 */}
            <button className="scroll-to-bottom-button" onClick={scrollToBottom}>
                ↓
            </button>
        </>
    );
}

export default OneTimeEventDetails;
