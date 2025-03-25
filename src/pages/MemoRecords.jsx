import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import MemoRecordDetails from "../components/MemoRecordDetails";
import DailyCheckUp from "./pages/DailyCheckUp.jsx";

function MemoRecords() {

    const [currentIndex, setCurrentIndex] = useState(() => {
        const savedIndex = localStorage.getItem("currentIndex");
        return savedIndex ? parseInt(savedIndex, 10) : 0; // 从 localStorage 获取当前索引，默认值为 0
    });
    const [filteredRecords, setFilteredRecords] = useState(() => {
        const savedRecords = localStorage.getItem("filteredRecords");
        return savedRecords ? JSON.parse(savedRecords) : []; // 从 localStorage 获取过滤后的记录
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [searchRecords, setSearchRecords] = useState([]);
    const [audio, setAudio] = useState(null);
    const navigate = useNavigate();    
 
    useEffect(() => {
 
        if (currentIndex === filteredRecords.length + 1) {
            getMemoRecords();
        }
    }, [currentIndex, filteredRecords.length]);

    useEffect(() => {
        localStorage.setItem("currentIndex", currentIndex);
        localStorage.setItem("filteredRecords", JSON.stringify(filteredRecords));
    }, [currentIndex, filteredRecords]);

    // 获取 memo records
    const getMemoRecords = () => {
        api
            .get("/api/memo_records_list/")
            .then((res) => res.data)
            .then((data) => {
                setFilteredRecords(data); // 更新为新的记录
                setCurrentIndex(0); // 重置 currentIndex
            })
            .catch((err) => {
                if (err.response && err.response.status === 401) {
                    alert("Your session has expired. Please log in again.");
                    localStorage.setItem("redirectUrl", window.location.pathname);
                    navigate("/login");
                } else {
                    alert(err);
                }
            });
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            api
                .get(`/api/memo_records/search/`, { params: { query: searchQuery } })
                .then((res) => res.data)
                .then((data) => {
                    setSearchRecords(data); // Update the filtered records based on the search result
                })
                .catch((err) => {
                    if (err.response && err.response.status === 401) {
                        alert("Your session has expired. Please log in again.");
                        localStorage.setItem("redirectUrl", window.location.pathname);
                        navigate("/login");
                    } else {
                        alert(err);
                    }
                });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (searchQuery.trim().length <= 2) {
                alert("Invalide search: try to put more letters or words!");
            } else {
                handleSearch(); // 处理搜索逻辑的函数
            }
        }
    };
    
    const currentRecord = filteredRecords[currentIndex];

    const goToNext = () => {
        if (currentIndex <= filteredRecords.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToCreateMemoRecord = () => {
        window.open("/create-memo-record", "_blank");
    };

    const goToTimer = () => {
        window.open(
            "https://www.google.com/search?q=online+timer",
            "_blank"
        );
    };
    
    const goToOneTimeEvents = () => {
        window.open("/one-time-events", "_blank");
    };

    const goToBlog = () => {
        window.open("/blog", "_blank");
    };
 
    const goToUpdateStudyScope = () => {
        
        const validRecord = filteredRecords.find(record => record.study_scope_id);

        if (validRecord && validRecord.study_scope_id) {
            navigate(`/update-study-scope`, { state: { study_scope_id: validRecord.study_scope_id.id } });
        } else {
            alert("No valid study_scope_id found.");
        }
    };
 
    const playSound_Music = () => {
        if (audio) {
            audio.pause(); // 停止当前音频播放
            audio.currentTime = 0; // 重置播放时间
        }
 
        const newAudio = new Audio("/worship1.mp3");
        newAudio.loop = true; // 设置音频循环播放
        newAudio.play()
            .then(() => console.log("Audio is now playing in a loop"))
            .catch((error) => console.error("Audio playback failed:", error));

        setAudio(newAudio); // 将新音频对象存储到状态中
    };

    const pauseSound_Music = () => {
        if (audio) {
            audio.pause(); // 停止音频播放
        }
    };

    const pauseSound = () => {
        if (audio) {
            audio.pause(); // 停止音频播放
            setAudio(null); // 清除音频对象状态
        }
    }; 
    const currentIndexAddOne = () => {
        setCurrentIndex(prevIndex => prevIndex + 1); // 递增 currentIndex
    };

    const handleEditToggle = (id) => {
        setSearchRecords((prevRecords) =>
            prevRecords.map((record) =>
                record.id === id
                    ? { 
                        ...record, 
                        isEditing: !record.isEditing, 
                        editingQuestion: record.question, 
                        editingRecordDetails: record.record_details 
                    }
                    : record
            )
        );
    };
 
    const handleRecordUpdate = (id) => {
        setSearchRecords((prevRecords) =>
            prevRecords.map((record) => {
                if (record.id === id) {
                    const updatedData = { 
                        question: record.editingQuestion,
                        record_details: record.editingRecordDetails 
                    };

                    // 模拟发送 PUT 请求
                    api
                        .put(`/api/memo_records/update/${id}/`, updatedData)
                        .then((res) => {
                            console.log("Record updated successfully");
                        })
                        .catch((err) => {
                            alert("Failed to update record");
                        });

                    return { ...record, ...updatedData, isEditing: false };
                }
                return record;
            })
        );
    };

    // 处理编辑框内容变化
    const handleEditChange = (id, field, value) => {
        setSearchRecords((prevRecords) =>
            prevRecords.map((record) =>
                record.id === id ? { ...record, [field]: value } : record
            )
        );
    };


    return (
        <div>
            <div>
                <h2>Memo Records</h2>

                <p>Records left: {filteredRecords.length - currentIndex < 0 ? 0 : filteredRecords.length - currentIndex}</p>

                <br />

                {currentIndex === filteredRecords.length ? (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <img 
                            // src="https://images.stockcake.com/public/7/9/7/797e5cc1-2496-4921-9309-ce6f28d6718b_large/joyful-office-celebration-stockcake.jpg" 
                            src="https://lh3.googleusercontent.com/pw/AP1GczOES0w0Elq-doaTAb4RI-Bfk2m4u1PCciSlk3-pNzMLd_QPIc8t0uy8xqrU-wghu8OJh8Di5tvsm5AzVp2vc-QGrcz83B8JgE8g3TNIGu-WTCnPDkrqQwBT0eNaxuIkJyy37SGAzL7ecLDT92JJYOM=w1842-h1100-s-no-gm?authuser=0"
                            onClick={currentIndexAddOne}
                            alt="Excited Friends"
                            style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
                        />
                        <br />
                        <br />
                    </div>
                ) : (
                    currentRecord && (
                        <div>
                            <MemoRecordDetails 
                                memo_record={currentRecord}
                                goToNext={goToNext} 
                            />
                            {currentRecord.author && <p>Author: {currentRecord.author}</p>}
                        </div>
                    )
                )}
            </div>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />             
            <div className="button-and-checkbox">
                <div className="button-and-checkbox-button">
                    <button className="btn-create-memo" onClick={goToCreateMemoRecord}>Create a Memo Record</button>
                    <br />
                    <br />
                    <button className="btn-one-time-events" onClick={goToOneTimeEvents}>One Time Events</button>
                    <br />
                    <br />
                    <button className="btn-blog" onClick={goToBlog}>Blog</button>
                    <br />
                    <br />
                    <button className="btn-update-scope" onClick={goToUpdateStudyScope}>Update Study Scope</button>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <a href="https://docs.google.com/document/d/1qmE2SwqJPqFz-CD0stcDgsVYuGIh9kDqjvcV4V0QNg8/edit?usp=sharing" target="_blank">
                        My Mission Statement
                    </a>
                    <br />
                    <br />
                    <a href="https://docs.google.com/presentation/d/1OjiYN3ScPyD2vEYY-bVW-YRJcEWrZIGzhh-yVD95BHA/edit#slide=id.g1013caa7b27_0_25" target="_blank">
                        LeetCode答案汇总
                    </a>
                    <br />
                    <br />
                    <a href="https://docs.google.com/document/d/1SePGb5BSwQoYypjvwrAkI_pZZKf_2De9C52bx79fAF0/edit?tab=t.0" target="_blank">
                        All LeetCode Questions
                    </a>
                    <br />
                    <br />
                    <a href="https://docs.google.com/spreadsheets/d/1QitHv0-EsULD9F5mNsWNiQxyDGmbD8Ku9lTcvqXpaOQ/edit?gid=0#gid=0" target="_blank">
                        公司Profile
                    </a>
                    <br />
                </div>
 
                <div id="div-iframe" style={{ width: '300px', height: '400px', border: '1px solid #ccc' }}>
                    <DailyCheckUp style={{ width: '100%', height: '100%' }} />
                </div>

            </div>
            <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
            <div>
                <br />   
                <br />
                <br />   
                <br />
                <button onClick={goToTimer}>Go to Timer</button>
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                

                <button onClick={playSound_Music}>Play Music</button>
                <button onClick={pauseSound_Music}>Pause Music</button>
                <br />   
                <br />
            </div>

            <br />
            <br />

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: "0px",
                }}
            >
                <input
                    type="text"
                    placeholder="Search for records"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown} // Add the event listener for Enter key
                />
            </div>
            <br />
            <br />


            <br />
            <br />

            {/* Display the filtered search results below currentRecord */}
            {/* {searchRecords.length > 0 && (
                <div className="search-results">
                    <h3>Search Results: {searchRecords.length}</h3>
                    <ul>
                        {searchRecords.map((record, index) => (
                            <li key={index}>
                                <p><strong>Question:</strong> {record.question}</p>
                                <p><strong>Record Detail:</strong> {record.record_details}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )} */}

            {/* {searchRecords.length > 0 && (
                <div className="search-results">
                    <h3>Search Results: {searchRecords.length}</h3>
                    <ul>
                        {searchRecords.map((record) => (
                            <li key={record.id}>
                                <div>
                                    {!record.isEditing ? (
                                        <>
                                            <p>
                                                <strong>Question:</strong> {record.question}
                                            </p>
                                            <p>
                                                <strong>Record Detail:</strong> {record.record_details}
                                            </p>
                                        </>
                                    ) : (
                                        <div>
                                            <div>
                                                <strong>Record Detail:</strong>
                                                <textarea
                                                    value={record.editingRecordDetails ?? record.record_details}
                                                    onChange={(e) => handleEditChange(record.id, e.target.value)}
                                                    style={{
                                                        height: "500px",
                                                        width: "1000px",
                                                        resize: "both",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleEditToggle(record.id)} 
                                    className="edit-button"
                                >
                                    {record.isEditing ? "Cancel Edit" : "Edit"}
                                </button>

                                {record.isEditing && (
                                    <button
                                        onClick={() => handleRecordUpdate(record.id)} // 保存更新
                                        className="save-button"
                                    >
                                        Save
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )} */}

            {searchRecords.length > 0 && (
                <div className="search-results">
                    <h3>Search Results: {searchRecords.length}</h3>
                    <ul>
                        {searchRecords.map((record) => (
                            <li key={record.id}>
                                <div>
                                    {!record.isEditing ? (
                                        <>
                                            <p>
                                                <strong>Question:</strong> {record.question}
                                            </p>
                                            <p>
                                                <strong>Record Detail:</strong> {record.record_details}
                                            </p>
                                        </>
                                    ) : (
                                        <div>
                                            <div>
                                                <strong style={{ marginRight: "38px" }}>Question: </strong>                                                                                             
                                                <textarea
                                                    type="text"
                                                    value={record.editingQuestion}
                                                    onChange={(e) => handleEditChange(record.id, 'editingQuestion', e.target.value)}
                                                    style={{
                                                        width: "1200px",  // 保持一致宽度
                                                        height: "300px",  // 调整输入框的高度
                                                        resize: "both",  // 允许调整大小
                                                        textAlign: "left",  // 左对齐文本
                                                        verticalAlign: "top",  // 顶部对齐文本
                                                    }}
                                                />
                                            </div>
                                            <br /> 
                                            <div>
                                                <strong style={{ marginRight: "8px" }}>Record Detail:</strong>                                                
                                                <textarea
                                                    value={record.editingRecordDetails}
                                                    onChange={(e) => handleEditChange(record.id, 'editingRecordDetails', e.target.value)}
                                                    style={{
                                                        width: "1200px",  // 保持一致宽度
                                                        height: "600px",  // 设置高度为 800px
                                                        resize: "both",  // 允许调整大小
                                                        textAlign: "left",  // 左对齐文本
                                                        verticalAlign: "top",  // 顶部对齐文本
                                                        paddingTop: "5px",  // 防止文字靠近边缘
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleEditToggle(record.id)} 
                                    className="edit-button"
                                >
                                    {record.isEditing ? "Cancel Edit" : "Edit"}
                                </button>

                                {record.isEditing && (
                                    <button
                                        onClick={() => handleRecordUpdate(record.id)} // 保存更新
                                        className="save-button"
                                    >
                                        Save
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
    
            <style>
                {`
                            /* 输入框样式 */
                            input {
                                padding: 10px;
                                font-size: 16px;
                                border-radius: 2px;
                                border: 1px solid #ccc;
                                width: 300px;
                            }

                            /* 标题样式 */
                            h2, h3 {
                                font-size: 1.5rem;
                                color: #333;
                            }

                            /* 搜索结果样式 */
                            .search-results {
                                margin-top: 10px;
                                padding: 15px;
                                border: 1px solid #ccc;
                                border-radius: 8px;
                                background-color: #f9f9f9;
                            }

                            .search-results h3 {
                                margin-bottom: 15px;
                                font-size: 1.5rem;
                            }

                            .search-results ul {
                                list-style: none;
                                padding: 0;
                                margin: 0;
                            }

                            .search-results li {
                                padding: 10px;
                                margin-bottom: 10px;
                                border-bottom: 1px solid #ddd;
                            }

                            .search-results p {
                                margin: 0;
                                font-size: 1rem;
                                color: #555;
                            }

                            .search-results strong {
                                color: #333;
                            }

                            /* Create a Memo Record 按钮样式 */
                            .btn-create-memo {
                                background-color: #4caf50;
                                color: white;
                                padding: 10px 20px;
                                font-size: 16px;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                                transition: background-color 0.3s ease;
                            }

                            .btn-create-memo:hover {
                                background-color: #45a049;
                            }

                            /* Create a Memo Record 按钮样式 */
                            .btn-create-memo {
                                background-color: #66bb6a; /* 更柔和的绿色 */
                                color: white;
                                padding: 8px 16px; /* 缩小按钮尺寸 */
                                font-size: 14px; /* 减小字体大小 */
                                border: none;
                                border-radius: 4px; /* 圆角效果 */
                                cursor: pointer;
                                transition: background-color 0.3s ease;
                            }

                            .btn-create-memo:hover {
                                background-color: #5caa57; /* 更深的绿色，保持和谐 */
                            }

                            /* One Time Events 按钮样式 */
                            .btn-one-time-events {
                                background-color: #e57373; /* 更柔和的红色 */
                                color: white;
                                padding: 8px 16px;
                                font-size: 14px;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                transition: background-color 0.3s ease;
                            }

                            .btn-one-time-events:hover {
                                background-color: #417f7f; /* 更深的蓝色 */
                            }

                            /* Blog 按钮样式 */
                            .btn-blog {
                                background-color: #4e8a8a; /* 更柔和的蓝色 */ 
                                color: white;
                                padding: 8px 16px;
                                font-size: 14px;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                transition: background-color 0.3s ease;
                            }

                            .btn-blog:hover {
                                background-color: #e04e4e; /* 更深的红色 */
                            }

                            /* Update Study Scope 按钮样式 */
                            .btn-update-scope {
                                background-color: #ffb74d; /* 更柔和的橙色 */
                                color: white;
                                padding: 8px 16px;
                                font-size: 14px;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                transition: background-color 0.3s ease;
                            }

                            .btn-update-scope:hover {
                                background-color: #ffa726; /* 更深的橙色 */
                            }

                            .button-and-checkbox {
                                display: flex; 
                                align-items: 
                                flex-start; gap: 20px;
                            }

                            .button-and-checkbox-button {
                                flex-basis: 800px;
                            }
                `}
            </style>   
        </div>
    );
}

export default MemoRecords;
