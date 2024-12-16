import { useState, useEffect } from "react";
import React from "react";
import "../styles/MemoRecords.css";
import api from "../api";
import { useNavigate } from "react-router-dom";
import MemoRecordDetails from "../components/MemoRecordDetails";

function MemoRecords() {
    const [memo_records, setMemoRecords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // state for search query
    const [filteredRecords, setFilteredRecords] = useState([]); // state for filtered records
    const [searchRecords, setSearchRecords] = useState([]); // state for filtered records

    const [timer, setTimer] = useState(1500); // 默认 25 分钟 (1500 秒)
    const [isTimerRunning, setIsTimerRunning] = useState(false); // 计时器状态

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
        navigate("/create-memo-record");
    };

    const goToOneTimeEvents = () => {
        navigate("/one-time-events");
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
        const audio = new Audio("/123.mp3");
        audio.play()
            .then(() => console.log("Audio played successfully"))
            .catch((error) => console.error("Audio playback failed:", error));
    };

    const startTimer = () => {
        setIsTimerRunning(true);
    };

    const pauseTimer = () => {
        setIsTimerRunning(false);
    };

    const resetTimer = () => {
        setTimer(1);
        setIsTimerRunning(false);
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
                    <div className="centered-img">
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
                <button onClick={goToOneTimeEvents}>One Time Events</button>  
                <br />
                <br />
                <button onClick={goToUpdateStudyScope}>Update Study Scope</button>   
                <br />   
            </div>
            
            <br />
            <br />

            <div className="center-container">
                <input
                    type="text"
                    placeholder="Search for records"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown} // Add the event listener for Enter key
                    className="search-input"
                />
            </div>
            <br />
            <br />
            {/* Display the filtered search results below currentRecord */}
            {searchRecords.length > 0 && (
                <div className="search-results">
                    <h3>Search Results: {searchRecords.length}</h3>
                    <ul className="search-results-list">
                        {searchRecords.map((record, index) => (
                            <li key={index} className="search-result-item">
                                <p className="search-result-field">
                                    <strong>Question:</strong> {record.question}
                                </p>
                                <p className="search-result-field">
                                    <strong>Record Detail:</strong> {record.record_details}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <h3>Timer: {formatTime(timer)}</h3>
                <button onClick={startTimer} disabled={isTimerRunning}>
                    Start
                </button>
                <button onClick={pauseTimer} disabled={!isTimerRunning}>
                    Pause
                </button>
                <button onClick={resetTimer}>Reset</button>
            </div>
        </div>
    );
}

export default MemoRecords;
