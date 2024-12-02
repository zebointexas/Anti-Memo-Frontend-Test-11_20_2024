import { useState, useEffect } from "react";
import api from "../api";
import MemoRecordDetails from "../components/MemoRecordDetails"
import "../styles/Home.css"

function MemoRecords() {
    
    const [memo_records, setMemoRecords] = useState([]);
    const [record_Details, setRecord_Details] = useState("");
    const [id, setId] = useState("");

    useEffect(() => {
        getMemoRecords();
    }, []);

    const getMemoRecords = () => {
        api
            .get("/api/memo_records/")
            .then((res) => res.data)
            .then((data) => {
                console.log("Data fetched: " + JSON.stringify(data) + "     data size: " + Object.keys(data).length); 
                setMemoRecords(data);
            })
            .catch((err) => alert(err));
    };
     
    const createMemoRecord = (e) => {
        e.preventDefault();
        api
            .post("/api/memo_records/", { record_Details })
            .then((res) => {
                if (res.status === 201) console.log("Note created!");
                else console.log("Failed to make note.");
                getMemoRecords();
            })
            .catch((err) => alert(err));
    };

    const updateMemoRecord = (e) => {
        e.preventDefault();
        api
            .put(`/api/memo_records/update/${id}/`, { record_Details }) // Use PUT instead of POST
            .then((res) => {
                if (res.status === 200) {
                    console.log("Note updated successfully!");
                } else {
                    console.log("Failed to update note.");
                }
                getMemoRecords(); // Refresh the memo list after update
            })
            .catch((err) => alert(err));
    };
    
    const deleteNote = (id) => {
        api
            .delete(`/api/memo_records/delete/${id}/`)
            .then((res) => {
                getMemoRecords();
            })
            .catch((error) => alert(error));
    };

// ################################################################################
// ################################################################################
// ################################################################################

    return (
        <div>
            <div>
                <h2>memo_records</h2>
                <p>Number of records: {memo_records.length}</p>
                {memo_records.map((memo_record) => {
                    // Print each record's details to the console
                    //console.log(memo_record);

                    return (
                        <MemoRecordDetails 
                            onDelete={deleteNote} 
                            key={memo_record.id} 
                            memo_record={memo_record}  
                        />
                    );
                })}
            </div>
 
            <h2>Create a Memo Record</h2>
            <form onSubmit={createMemoRecord}>
                <label htmlFor="content">Content:</label>
                <br />
                <textarea
                    id="content"
                    name="content"
                    required
                    value={record_Details}
                    onChange={(e) => setRecord_Details(e.target.value)}
                ></textarea>
                <br />
                <input type="submit" value="Submit"></input>
            </form>
        </div>
    );
}

export default MemoRecords;