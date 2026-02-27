import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import MemoRecordDetails from "../components/MemoRecordDetails";
import DailyCheckUp from "./DailyCheckUp.jsx";

function MemoRecords() {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = localStorage.getItem("currentIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  const [filteredRecords, setFilteredRecords] = useState(() => {
    const savedRecords = localStorage.getItem("filteredRecords");
    return savedRecords ? JSON.parse(savedRecords) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchRecords, setSearchRecords] = useState([]);
  const [audio, setAudio] = useState(null);
  // New state for subject_type and study_scope
  const [currentSubjectType, setCurrentSubjectType] = useState(() => {
    return localStorage.getItem("currentSubjectType") || "";
  });
  const [currentStudyScope, setCurrentStudyScope] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentIndex === filteredRecords.length + 1) {
      getMemoRecords();
    }
  }, [currentIndex, filteredRecords.length]);

  // Fetch study_scope details based on study_scope_id
  useEffect(() => {
    const studyScopeId = localStorage.getItem("studyScopeId");
    if (studyScopeId) {
      api
        .get(`/api/study_scope/${studyScopeId}/`)
        .then((res) => res.data)
        .then((data) => {
          setCurrentStudyScope(data.study_scope);
        })
        .catch((err) => {
          console.error("Failed to fetch study scope:", err);
        });
    }
  }, []);

  // Update cached study_scope_id, subject_type, and localStorage
  useEffect(() => {
    if (filteredRecords.length > 0) {
      const studyScopeId = filteredRecords[0]?.study_scope_id?.id;
      const subjectType = filteredRecords[0]?.subject_type;
      if (studyScopeId) {
        localStorage.setItem("studyScopeId", studyScopeId);
      }
      if (subjectType) {
        setCurrentSubjectType(subjectType);
        localStorage.setItem("currentSubjectType", subjectType);
      }
    }
    localStorage.setItem("currentIndex", currentIndex);
    localStorage.setItem("filteredRecords", JSON.stringify(filteredRecords));
  }, [currentIndex, filteredRecords]);

  // Fetch memo records and cache study_scope_id
  const getMemoRecords = () => {
    api
      .get("/api/memo_records_list/")
      .then((res) => res.data)
      .then((data) => {
        setFilteredRecords(data);
        setCurrentIndex(0);
        // Cache study_scope_id and subject_type if records exist
        if (data.length > 0) {
          const studyScopeId = data[0]?.study_scope_id?.id;
          const subjectType = data[0]?.subject_type;
          if (studyScopeId) {
            localStorage.setItem("studyScopeId", studyScopeId);
          }
          if (subjectType) {
            setCurrentSubjectType(subjectType);
            localStorage.setItem("currentSubjectType", subjectType);
          }
        }
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
          setSearchRecords(data);
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

  const handleToggleActive = (record) => {
    const newActiveStatus = !record.is_activate;
    api
      .put(`/api/memo_records/update/${record.id}/`, {
        is_activate: newActiveStatus,
      })
      .then(() => {
        console.log(`Record ${record.id} is_activate set to ${newActiveStatus}`);
        setSearchRecords((prevRecords) =>
          prevRecords.map((r) =>
            r.id === record.id ? { ...r, is_activate: newActiveStatus } : r
          )
        );
        if (filteredRecords.some((r) => r.id === record.id)) {
          setFilteredRecords((prevRecords) =>
            prevRecords.map((r) =>
              r.id === record.id ? { ...r, is_activate: newActiveStatus } : r
            )
          );
          localStorage.setItem(
            "filteredRecords",
            JSON.stringify(
              filteredRecords.map((r) =>
                r.id === record.id ? { ...r, is_activate: newActiveStatus } : r
              )
            )
          );
        }
      })
      .catch((err) => {
        console.error("Failed to update is_activate:", err);
        alert("Failed to update record's active status.");
      });
  };

  const addTop15RecordsToFiltered = () => {
    const subject_type =
      filteredRecords.length > 0 && filteredRecords[0].subject_type
        ? filteredRecords[0].subject_type
        : currentSubjectType;

    if (!subject_type) {
      alert("No valid SubjectType found in the current records.");
      return;
    }

    alert(subject_type);

    api
      .get("/api/memo_records/top15/", { params: { subject_type: subject_type } })
      .then((res) => res.data)
      .then((data) => {
        if (data.length === 0) {
          alert("No records found for the current subject type.");
          return;
        }

        Promise.all(
          data.map((record) =>
            api.put(`/api/memo_records/update/${record.id}/`, {
              current_learning_session: true,
            })
          )
        )
          .then((responses) => {
            console.log(
              "Top 5 records updated with current_learning_session = true"
            );
            const updatedRecords = data.map((record) => ({
              ...record,
              current_learning_session: true,
            }));
            const newFilteredRecords = [...filteredRecords, ...updatedRecords];
            setFilteredRecords(newFilteredRecords);
            localStorage.setItem(
              "filteredRecords",
              JSON.stringify(newFilteredRecords)
            );
            localStorage.setItem("currentIndex", "0");
            alert("Top 5 records have been added to filtered records.");
          })
          .catch((err) => {
            console.error(
              "Failed to update current_learning_session for top 5 records:",
              err
            );
            alert("Failed to update records' learning session status.");
          });
      })
      .catch((err) => {
        console.error("Failed to fetch top 5 records:", err);
        alert("Failed to fetch top 5 records.");
      });
  };

  const resetCurrentLearningSession_for_current_subject_type = () => {
    const subject_type =
      filteredRecords.length > 0 && filteredRecords[0].subject_type
        ? filteredRecords[0].subject_type
        : null;

    if (!subject_type) {
      alert("No valid SubjectType ID found in the current records.");
      return;
    }

    alert(`Are you sure you want to reset all learning records for "${subject_type}"?`)

    alert(`Warning: This will permanently erase all records associated with the current subject type "${subject_type}". Do you wish to continue?`)

    alert(`Final confirmation: Proceed with resetting all records for the current subject type "${subject_type}"? This action is permanent and cannot be undone.`)
 
    api
      .post("/api/memo_records/reset-current-learning-session/", {
        subject_type: subject_type,
      })
      .then((res) => {
        console.log(res.data.message);
        alert(res.data.message);
        const updatedFilteredRecords = filteredRecords.map((record) => ({
          ...record,
          current_learning_session: false,
        }));
        setFilteredRecords(updatedFilteredRecords);
        localStorage.setItem(
          "filteredRecords",
          JSON.stringify(updatedFilteredRecords)
        );
      })
      .catch((err) => {
        console.error("Failed to reset current_learning_session:", err);
        const errorMessage =
          err.response?.data?.error ||
          "Failed to reset current_learning_session.";
        alert(errorMessage);
      });
  };

  const addSingleRecordToFiltered = (record) => {
    const recordExists = filteredRecords.some((r) => r.id === record.id);
    if (recordExists) {
      alert("This record is already in filtered records, no need to add.");
      return;
    }

    api
      .put(`/api/memo_records/update/${record.id}/`, {
        current_learning_session: true,
      })
      .then((res) => {
        console.log(
          `Record ${record.id} updated with current_learning_session = true`
        );
        const updatedRecord = { ...record, current_learning_session: true };
        const newFilteredRecords = [...filteredRecords, updatedRecord];
        setFilteredRecords(newFilteredRecords);
        localStorage.setItem(
          "filteredRecords",
          JSON.stringify(newFilteredRecords)
        );
        localStorage.setItem("currentIndex", currentIndex.toString());
        console.log(`Record with id ${record.id} added to filtered records.`);
      })
      .catch((err) => {
        console.error("Failed to update current_learning_session:", err);
        alert("Failed to update record's learning session status.");
      });
  };

  const removeSingleRecordToFiltered = (record) => {
    const recordExists = filteredRecords.some((r) => r.id === record.id);
    if (!recordExists) {
      alert("This record is not in filtered records, no need to remove.");
      return;
    }

    api
      .put(`/api/memo_records/update/${record.id}/`, {
        current_learning_session: false,
      })
      .then((res) => {
        console.log(
          `Record ${record.id} updated with current_learning_session = false`
        );
        const newFilteredRecords = filteredRecords.filter(
          (r) => r.id !== record.id
        );
        setFilteredRecords(newFilteredRecords);
        localStorage.setItem(
          "filteredRecords",
          JSON.stringify(newFilteredRecords)
        );

        const newIndex = Math.min(currentIndex, newFilteredRecords.length);
        setCurrentIndex(newIndex);
        localStorage.setItem("currentIndex", newIndex.toString());
        console.log(`Record with id ${record.id} removed from filtered records.`);
      })
      .catch((err) => {
        console.error("Failed to update current_learning_session:", err);
        alert("Failed to remove record from filtered records.");
      });
  };

  const addSearchToFilteredRecords = () => {
    if (searchRecords.length > 0) {
      const searchRecordsTop50 = searchRecords.slice(0, 50);
      Promise.all(
        searchRecordsTop50.map((record) =>
          api.put(`/api/memo_records/update/${record.id}/`, {
            current_learning_session: true,
          })
        )
      )
        .then((responses) => {
          console.log("All records updated with current_learning_session = true");
          const updatedSearchRecords = searchRecordsTop50.map((record) => ({
            ...record,
            current_learning_session: true,
          }));
          const newFilteredRecords = [...filteredRecords, ...updatedSearchRecords];
          setFilteredRecords(newFilteredRecords);
          localStorage.setItem(
            "filteredRecords",
            JSON.stringify(newFilteredRecords)
          );
          localStorage.setItem("currentIndex", "0");
          setSearchRecords([]);
          setSearchQuery("");
          console.log(
            "Search results have been added to filtered records (up to 50 records)."
          );
        })
        .catch((err) => {
          console.error(
            "Failed to update current_learning_session for records:",
            err
          );
          alert("Failed to update records' learning session status.");
        });
    } else {
      alert("No search results to add.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (searchQuery.trim().length <= 2) {
        alert("Invalid search: try to put more letters or words!");
      } else {
        handleSearch();
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
    window.open("https://www.google.com/search?q=online+timer", "_blank");
  };

  const goToOneTimeEvents = () => {
    window.open("/one-time-events", "_blank");
  };

  const goToBlog = () => {
    window.open("/blog", "_blank");
  };

  const goToUpdateStudyScope = () => {
    const validRecord = filteredRecords.find((record) => record.study_scope_id);
    const cachedStudyScopeId = localStorage.getItem("studyScopeId");

    if (validRecord && validRecord.study_scope_id) {
      navigate(`/update-study-scope`, {
        state: { study_scope_id: validRecord.study_scope_id.id },
      });
    } else if (cachedStudyScopeId) {
      navigate(`/update-study-scope`, {
        state: { study_scope_id: parseInt(cachedStudyScopeId, 10) },
      });
    } else {
      alert("No valid study_scope_id found in records or cache.");
    }
  };

  const playSound_Music = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const newAudio = new Audio("/worship1.mp3");
    newAudio.loop = true;
    newAudio
      .play()
      .then(() => console.log("Audio is now playing in a loop"))
      .catch((error) => console.error("Audio playback failed:", error));

    setAudio(newAudio);
  };

  const pauseSound_Music = () => {
    if (audio) {
      audio.pause();
    }
  };

  const pauseSound = () => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
  };

  const currentIndexAddOne = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleEditToggle = (id) => {
    setSearchRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.id === id
          ? {
              ...record,
              isEditing: !record.isEditing,
              editingQuestion: record.question,
              editingRecordDetails: record.record_details,
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
            record_details: record.editingRecordDetails,
          };

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
        

        <p>
          Records left:{" "}
          {filteredRecords.length - currentIndex < 0
            ? 0
            : filteredRecords.length - currentIndex}
        </p>

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
              src="https://i.gifer.com/2DV.gif"
              onClick={currentIndexAddOne}
              alt="Excited Friends"
              style={{ width: "50%", height: "auto", maxWidth: "50%" }}
            />
            <br />
            <br />
          </div>
        ) : (
          currentRecord && (
            <div>
              <MemoRecordDetails memo_record={currentRecord} goToNext={goToNext} />
              {currentRecord.author && <p>Author: {currentRecord.author}</p>}

              {/* Display subject_type and study_scope details */}
              <div style={{ marginBottom: "20px" }}>
                    <p>
                        Subject Type:{" "}
                        {currentSubjectType || "Not set"}
                    </p>
                    {/* <p>
                        Study Scope:{" "}
                        {currentStudyScope
                        ? `Subject: ${currentStudyScope.subject_type}, Category: ${currentStudyScope.category}`
                        : "Not set"}
                    </p> */}
              </div>
            </div>
          )
        )}
      </div>
      <div>
        <button className="btn-add-top15" onClick={addTop15RecordsToFiltered}>
          Add 5 new Memo Records
        </button>
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
          <button className="btn-create-memo" onClick={goToCreateMemoRecord}>
            Create a Memo Record
          </button>
          <br />
          <br />
          <button className="btn-one-time-events" onClick={goToOneTimeEvents}>
            One Time Events
          </button>
          <br />
          <br />
          <button className="btn-blog" onClick={goToBlog}>Blog</button>
          <br />
          <br />
          <button className="btn-update-scope" onClick={goToUpdateStudyScope}>
            Update Study Scope
          </button>
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
          <br />
          <br />
          <br />
          <br />
          <a
            href="https://docs.google.com/document/d/1qmE2SwqJPqFz-CD0stcDgsVYuGIh9kDqjvcV4V0QNg8/edit?usp=sharing"
            target="_blank"
          >
            My Mission Statement
          </a>
          <br />
          <br />
          <a
            href="https://docs.google.com/presentation/d/1OjiYN3ScPyD2vEYY-bVW-YRJcEWrZIGzhh-yVD95BHA/edit#slide=id.g1013caa7b27_0_25"
            target="_blank"
          >
            LeetCode答案汇总
          </a>
          <br />
          <br />
          <a
            href="https://docs.google.com/document/d/1SePGb5BSwQoYypjvwrAkI_pZZKf_2De9C52bx79fAF0/edit?tab=t.0"
            target="_blank"
          >
            All LeetCode Questions
          </a>
          <br />
          <br />
          <a
            href="https://docs.google.com/spreadsheets/d/1QitHv0-EsULD9F5mNsWNiQxyDGmbD8Ku9lTcvqXpaOQ/edit?gid=0#gid=0"
            target="_blank"
          >
            公司Profile
          </a>
          <br />
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
          onKeyDown={handleKeyDown}
        />
      </div>
      <br />
      <br />

      <br />
      <br />

      {searchRecords.length > 0 && (
        <div className="search-results">
          <h3>Search Results: {searchRecords.length}</h3>
          <button
            className="btn-add-to-filtered"
            onClick={addSearchToFilteredRecords}
          >
            Add All to Filtered Records
          </button>
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
                      <p>
                        <strong>Active Status:</strong>{" "}
                        {record.is_activate ? "Active" : "Inactive"}
                      </p>
                    </>
                  ) : (
                    <div>
                      <div>
                        <strong style={{ marginRight: "38px" }}>Question: </strong>
                        <textarea
                          type="text"
                          value={record.editingQuestion}
                          onChange={(e) =>
                            handleEditChange(record.id, "editingQuestion", e.target.value)
                          }
                          style={{
                            width: "1200px",
                            height: "300px",
                            resize: "both",
                            textAlign: "left",
                            verticalAlign: "top",
                          }}
                        />
                      </div>
                      <br />
                      <div>
                        <strong style={{ marginRight: "8px" }}>
                          Record Detail:
                        </strong>
                        <textarea
                          value={record.editingRecordDetails}
                          onChange={(e) =>
                            handleEditChange(
                              record.id,
                              "editingRecordDetails",
                              e.target.value
                            )
                          }
                          style={{
                            width: "1200px",
                            height: "600px",
                            resize: "both",
                            textAlign: "left",
                            verticalAlign: "top",
                            paddingTop: "5px",
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="button-group">
                  <button
                    onClick={() => handleEditToggle(record.id)}
                    className="edit-button"
                  >
                    {record.isEditing ? "Cancel Edit" : "Edit"}
                  </button>
                  {record.isEditing && (
                    <button
                      onClick={() => handleRecordUpdate(record.id)}
                      className="save-button"
                    >
                      Save
                    </button>
                  )}
                  <button
                    onClick={() => addSingleRecordToFiltered(record)}
                    className="btn-add-single-to-filtered"
                  >
                    Add to Filtered Records
                  </button>
                  <button
                    onClick={() => removeSingleRecordToFiltered(record)}
                    className="btn-remove-single-to-filtered"
                  >
                    Remove from Filtered Records
                  </button>
                  <button
                    onClick={() => handleToggleActive(record)}
                    className="btn-toggle-active"
                    data-active={record.is_activate}
                  >
                    {record.is_activate ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="btn-reset-learning-session"
        onClick={resetCurrentLearningSession_for_current_subject_type}
      >
        Reset Current Learning Session (for current study type)
      </button>

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
            background-color: #66bb6a;
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .btn-create-memo:hover {
            background-color: #5caa57;
          }

          /* One Time Events 按钮样式 */
          .btn-one-time-events {
            background-color: #e57373;
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .btn-one-time-events:hover {
            background-color: #417f7f;
          }

          /* Blog 按钮样式 */
          .btn-blog {
            background-color: #4e8a8a;
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .btn-blog:hover {
            background-color: #e04e4e;
          }

          /* Update Study Scope 按钮样式 */
          .btn-update-scope {
            background-color: #ffb74d;
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
          }

          .btn-update-scope:hover {
            background-color: #ffa726;
          }

          .btn-reset-learning-session {
            background-color: rgb(232, 232, 232);
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            float: right;
          }

          .btn-reset-learning-session:hover {
            background-color: rgb(247, 213, 213);
          }

          .button-and-checkbox {
            display: flex;
            align-items: flex-start;
            gap: 20px;
          }

          .button-and-checkbox-button {
            flex-basis: 800px;
          }

          .btn-add-to-filtered {
            background-color: #2196f3;
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            margin-bottom: 15px;
          }

          .btn-add-to-filtered:hover {
            background-color: #1976d2;
          }

          .btn-add-single-to-filtered {
            background-color: #2196f3;
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            margin-left: 10px;
          }

          .btn-add-single-to-filtered:hover {
            background-color: #1976d2;
          }

          .btn-remove-single-to-filtered {
            background-color: rgb(240, 172, 172);
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            margin-left: 10px;
          }

          .btn-remove-single-to-filtered:hover {
            background-color: rgb(211, 59, 59);
          }

          .btn-add-top15 {
            background-color: rgba(25, 118, 210, 0.25);
            color: white;
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s ease;
            float: right;
          }

          .btn-add-top15:hover {
            background-color: rgba(33, 133, 214, 0.87);
          }

          .button-group {
            display: flex;
            gap: 10px;
            margin-top: 10px;
            align-items: center;
          }

          .btn-toggle-active {
            padding: 8px 16px;
            font-size: 14px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: white;
            transition: background-color 0.3s ease;
            margin-left: auto;
          }

          .btn-toggle-active[data-active="true"] {
            background-color: #ff6b6b;
          }

          .btn-toggle-active[data-active="true"]:hover {
            background-color: #d32f2f;
          }

          .btn-toggle-active[data-active="false"] {
            background-color: #4caf50;
          }

          .btn-toggle-active[data-active="false"]:hover {
            background-color: #388e3c;
          }
        `}
      </style>
    </div>
  );
}

export default MemoRecords;