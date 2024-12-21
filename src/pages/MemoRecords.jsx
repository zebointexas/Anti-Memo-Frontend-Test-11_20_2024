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
    const [timer, setTimer] = useState(960);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const navigate = useNavigate();

    const [checkboxes, setCheckboxes] = useState({
        resume: false,
        toastmaster: false,
        algorithm: false,
        java: false,
        sql: false,
        systemDesign: false,
    });

    // 加载本地存储中的勾选状态
    useEffect(() => {
        const savedState = Object.keys(checkboxes).reduce((acc, key) => {
            const storedValue = localStorage.getItem(key);
            acc[key] = storedValue === 'true';
            return acc;
        }, {});
        setCheckboxes(savedState);
    }, []);

    // 更新本地存储中的状态
    const handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        const newCheckboxes = { ...checkboxes, [id]: checked };
        setCheckboxes(newCheckboxes);
        localStorage.setItem(id, checked);
    };

    // 提交按钮是否可用
    const allChecked = Object.values(checkboxes).every((isChecked) => isChecked);

    // 提交事件
    const handleSubmit = () => {
        alert('打卡成功！');
        const resetCheckboxes = Object.keys(checkboxes).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});
        setCheckboxes(resetCheckboxes);
        Object.keys(resetCheckboxes).forEach((key) => localStorage.setItem(key, 'false'));
    };

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
                setTimer(960); // 重置 25 分钟
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
                <div id="div-iframe">
                    <iframe id="iframe" src="http://localhost:5173/daily-check-up"  width="300" height="340"></iframe>
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
                                background-color: #4e8a8a; /* 更柔和的蓝色 */
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
                                background-color: #e57373; /* 更柔和的红色 */
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
