import React, { useEffect, useState } from 'react';

function DailyCheckUp() {
    const [checkboxes, setCheckboxes] = useState({
        resume: false,
        toastmaster: false,
        algorithm: false,
        java: false,
        sql: false,
        systemDesign: false,
        beAHuman: false, 
        tabata: false
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

    const today = new Date();

    // 转换成本地时间，只显示月和日
    const formattedDate = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

    // 提交事件
    const handleSubmit = () => {

        alert('今日' + formattedDate + '打卡成功！');

        const resetCheckboxes = Object.keys(checkboxes).reduce((acc, key) => {
            acc[key] = false;
            return acc;
        }, {});

        setCheckboxes(resetCheckboxes);
        Object.keys(resetCheckboxes).forEach((key) => localStorage.setItem(key, 'false'));
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
            <h1 style={{ color: '#333' }}>每日打卡</h1>
            <div
                className="checkbox-container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    marginBottom: '20px',
                }}
            >
                <label>
                    <input
                        type="checkbox"
                        id="resume"
                        checked={checkboxes.resume}
                        onChange={handleCheckboxChange}
                    />{' '}
                    简历5封
                </label>
                <label>
                    <input
                        type="checkbox"
                        id="toastmaster"
                        checked={checkboxes.toastmaster}
                        onChange={handleCheckboxChange}
                    />{' '}
                    查看Toast Master
                </label>
                <label>
                    <input
                        type="checkbox"
                        id="algorithm"
                        checked={checkboxes.algorithm}
                        onChange={handleCheckboxChange}
                    />{' '}
                    算法
                </label>
                <label>
                    <input
                        type="checkbox"
                        id="java"
                        checked={checkboxes.java}
                        onChange={handleCheckboxChange}
                    />{' '}
                    Java
                </label>
                <label>
                    <input
                        type="checkbox"
                        id="sql"
                        checked={checkboxes.sql}
                        onChange={handleCheckboxChange}
                    />{' '}
                    SQL
                </label>
                <label>
                    <input
                        type="checkbox"
                        id="systemDesign"
                        checked={checkboxes.systemDesign}
                        onChange={handleCheckboxChange}
                    />{' '}
                    系统设计
                </label>
                <label>
                    <input
                        type="checkbox"
                        id="tabata"
                        checked={checkboxes.tabata}
                        onChange={handleCheckboxChange}
                    />{' '}
                    Tabata
                </label>
                <label>
                    <input
                        type="checkbox"
                        id="beAHuman"
                        checked={checkboxes.beAHuman}
                        onChange={handleCheckboxChange}
                    />{' '}
                    善待身边的人
                </label>
            </div>
            <div style={{ textAlign: 'right' }}>
                <button
                    onClick={handleSubmit}
                    disabled={!allChecked}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: allChecked ? '#007BFF' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: allChecked ? 'pointer' : 'not-allowed',
                    }}
                >
                    Submit
                </button>
            </div>
        </div>
    );
}

export default DailyCheckUp;
