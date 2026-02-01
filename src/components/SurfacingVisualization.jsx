import { useState, useEffect } from 'react';
import './SurfacingVisualization.css';
import { contentData } from './contentData';

function SurfacingVisualization() {
    const [isDaytime, setIsDaytime] = useState(true);
    const [testMode, setTestMode] = useState(false);
    const [currentContent, setCurrentContent] = useState(null);
    const [manualDayIndex, setManualDayIndex] = useState(null);

    // Get content index based on day of year
    const getDayOfYear = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    };

    useEffect(() => {
        // Update content based on day of year or manual override
        const dayIndex = manualDayIndex !== null ? manualDayIndex : getDayOfYear() % contentData.length;
        setCurrentContent(contentData[dayIndex]);
    }, [manualDayIndex]);

    useEffect(() => {
        if (testMode) return; // Skip auto-update in test mode

        const updateDayNight = () => {
            const hour = new Date().getHours();
            // Daytime: 6 AM (6) to 6 PM (18)
            const isDay = hour >= 6 && hour < 18;
            setIsDaytime(isDay);
        };

        // Update immediately
        updateDayNight();

        // Update every minute
        const interval = setInterval(updateDayNight, 60000);

        return () => clearInterval(interval);
    }, [testMode]);

    const toggleDayNight = () => {
        setTestMode(true);
        setIsDaytime(!isDaytime);
    };

    const nextDay = () => {
        const currentIndex = manualDayIndex !== null ? manualDayIndex : getDayOfYear() % contentData.length;
        setManualDayIndex((currentIndex + 1) % contentData.length);
    };

    const prevDay = () => {
        const currentIndex = manualDayIndex !== null ? manualDayIndex : getDayOfYear() % contentData.length;
        setManualDayIndex((currentIndex - 1 + contentData.length) % contentData.length);
    };

    const resetToToday = () => {
        setManualDayIndex(null);
        setTestMode(false);
        const hour = new Date().getHours();
        setIsDaytime(hour >= 6 && hour < 18);
    };

    if (!currentContent) return null;

    const content = isDaytime ? currentContent.day : currentContent.night;
    const currentIndex = manualDayIndex !== null ? manualDayIndex : getDayOfYear() % contentData.length;

    return (
        <div className={`surfacing-container ${isDaytime ? 'day' : 'night'}`}>
            <div className="test-controls">
                {/* <button className="test-toggle" onClick={toggleDayNight}>
                    Toggle {isDaytime ? 'Night' : 'Day'} Mode
                </button> */}
                <div className="day-controls">
                    {/* <button onClick={prevDay}>← Prev Day</button>
                    <span className="day-indicator">Day {currentIndex + 1}/{contentData.length}</span>
                    <button onClick={nextDay}>Next Day →</button>
                    <button onClick={resetToToday}>Reset to Today</button> */}
                </div>
            </div>

            <div className="content-wrapper">
                <div className="window-controls">
                    <span className="close-x">✕</span>
                </div>
                <h1>SPEECH OF VOLATILE CREATURE</h1>

                <h3>{content.title}</h3>
                <p>{content.description}</p>
            </div>

            {/* Log Table */}
            <div className="log-container">
                <h2 className="log-title">SPEECH LOG</h2>
                <div className="log-table-wrapper">
                    <table className="log-table">
                        <thead>
                            <tr>
                                <th>DAY</th>
                                <th>TITLE (DAY VERSION)</th>
                                <th>DAY PERIOD</th>
                                <th>NIGHT PERIOD</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contentData.map((entry, index) => {
                                // Only show entries up to current day
                                if (index > currentIndex) return null;

                                return (
                                    <tr key={index} className={index === currentIndex ? 'active-row' : ''}>
                                        <td>{index + 1}</td>
                                        <td>{entry.day.title}</td>
                                        <td>06:00 - 18:00</td>
                                        <td>18:00 - 06:00</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SurfacingVisualization;
