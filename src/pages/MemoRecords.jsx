import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import MemoRecordDetails from "../components/MemoRecordDetails";

function MemoRecords() {
    const [memo_records, setMemoRecords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchRecords, setSearchRecords] = useState([]);
    const [audio, setAudio] = useState(null);
    const [timer, setTimer] = useState(1500);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        getMemoRecords();
    }, [refreshKey]);

    useEffect(() => {
        let timerInterval;
        if (isTimerRunning && timer > 0) {
            timerInterval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(timerInterval);
            playSound();
            setTimeout(() => {
                alert("休息时间结束，请返回工作！");
                setTimer(1500); // 重置 25 分钟
                setIsTimerRunning(false);
            }, 300000); // 5 分钟后提示
        }
        return () => clearInterval(timerInterval);
    }, [isTimerRunning, timer]);

    const getMemoRecords = () => {
        api
            .get("/api/memo_records_list/")
            .then((res) => res.data)
            .then((data) => {
                console.log("Data fetched: " + JSON.stringify(data) + "     data size: " + Object.keys(data).length);
                setMemoRecords(data);
                setFilteredRecords(data); // Initialize with all records when fetched
                setCurrentIndex(0);
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
        } else {
            setSearchRecords(memo_records); // If search query is empty, show all records
        }
    };

    // Handle pressing the Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(); // Trigger search when Enter key is pressed
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

    const goToOneTimeEvents = () => {
        window.open("/one-time-events", "_blank");
    };

    const goToBlog = () => {
        window.open("/blog", "_blank");
    };

    const refreshData = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    const goToUpdateStudyScope = () => {
        const validRecord = memo_records.find(record => record.study_scope_id);
        if (validRecord && validRecord.study_scope_id) {
            navigate(`/update-study-scope`, { state: { study_scope_id: validRecord.study_scope_id.id } });
        } else {
            alert("No valid study_scope_id found.");
        }
    };

    const playSound = () => {
        const newAudio = new Audio("/ring_sound.mp3");
        newAudio.loop = true; // 设置音频循环播放
        newAudio.play()
            .then(() => console.log("Audio is now playing in a loop"))
            .catch((error) => console.error("Audio playback failed:", error));
        setAudio(newAudio); // 将音频对象存储到状态中
    };

    const playSound_Music = () => {
        // 如果有正在播放的音频，先暂停并重置
        if (audio) {
            audio.pause(); // 停止当前音频播放
            audio.currentTime = 0; // 重置播放时间
        }

        // 创建新音频对象并播放
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

    const startTimer = () => {
        setIsTimerRunning(true);
    };

    const resetTimer = () => {
        setTimer(1500);
        setIsTimerRunning(false);
        pauseSound(); // 确保在重置时停止音频播放
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
    };

    return (
        <div>
            <style>
                {`
                            /* 样式合并和简化 */
                            .button-container {
                                flex: 1; /* 按钮区域占据较小空间 */
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                margin-left: 20px;
                            }

                            .button-container button {
                                margin: 10px 0;
                                padding: 10px 20px;
                                font-size: 16px;
                                border: none;
                                border-radius: 5px;
                                cursor: pointer;
                                width: 100%;
                                transition: opacity 0.2s ease-in-out; /* 统一按钮 hover 效果 */
                            }

                            /* 为不同按钮设置背景颜色 */
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

                            .button-container button:hover {
                                opacity: 0.9;
                            }

                            .button-container .timer-info {
                                margin-bottom: 10px;
                            }

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
                `}
            </style>

            <div>
                <h2>Memo Records</h2>

                <p>Records left: {filteredRecords.length - currentIndex}</p>

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
                            src="https://media.tenor.com/ZzQNUhQckqMAAAAC/excited-friends.gif" 
                            onClick={refreshData}
                            alt="Excited Friends"
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
            <div>
                <button onClick={goToCreateMemoRecord}>Create a Memo Record</button>  
                <br />
                <br />
                <button onClick={goToUpdateStudyScope}>Update Study Scope</button>   
                <br />
                <br />
                <button onClick={goToOneTimeEvents}>One Time Events</button>  
                <br />   
                <br />
                <button onClick={goToBlog}>Blog</button>   
                <br />   
                <br />
                <br />   
                <br />
            </div>
            
            <div>
                <h3>Timer: {formatTime(timer)}</h3>
                <button onClick={startTimer} disabled={isTimerRunning}>
                    Start
                </button>
                <button onClick={resetTimer}>Reset</button>

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
            {searchRecords.length > 0 && (
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
            )}
        </div>
    );
}

export default MemoRecords;
