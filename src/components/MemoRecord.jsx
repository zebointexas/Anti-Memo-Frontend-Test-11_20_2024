import React from "react";
import "../styles/Note.css"

function MemoRecord({ memo_record}) {

    return (
        <div className="memo_record-container">
            <p className="memo_record-content">{memo_record.record_Details}</p>
            <p>Test Details</p>
        </div>
    );
}

export default MemoRecord