import React, { useEffect, useState } from "react";
import { getLeaveHistory } from "../services/leaveService";
import { getCurrentUser } from "../services/authService";
import "../assets/styles.css";

function CalendarView({ refreshTrigger }) {
  const [leaves, setLeaves] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  //Fetches leave data for the calendar
  useEffect(() => {
    const fetchLeaves = async () => {
      const user = getCurrentUser();
      if (user) {
        try {
          const data = await getLeaveHistory(user.id);
          setLeaves(data);
        } catch (err) {
          console.error("Failed to load calendar data");
        }
      }
    };
    fetchLeaves();
  }, [refreshTrigger]);

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Navigate to current month
  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  /**
   * Renders a single month calendar
   * @param {Date} date - Date for the month to render
   */
  const renderMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const today = new Date();

    /**
     * Finds leave record for a specific day
     * @param {number} day - Day of the month
     * @returns {Object|null} Leave record if found
     */
    const getLeaveForDay = (day) => {
      const dateStr = new Date(year, month, day).toISOString().split("T")[0];
      return leaves.find(
        (l) => dateStr >= l.from_date && dateStr <= l.to_date
      );
    };

    /**
     * Returns color based on leave status
     * @param {string} status - Leave status
     * @returns {string} Background color
     */
    const getLeaveColor = (status) => {
      switch (status) {
        case "AUTO_APPROVED":
        case "APPROVED":
          return "#10b981";
        case "PENDING":
          return "#f59e0b";
        case "PRIORITY_REVIEW":
          return "#f97316";
        case "REJECTED":
          return "#ef4444";
        default:
          return "#6b7280";
      }
    };

    return (
      <div className="single-month-calendar" key={`${year}-${month}`}>
        <h4 className="month-title">
          {date.toLocaleString("default", { month: "long" })} {year}
        </h4>
        
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}

          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} className="calendar-cell empty" />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const leave = getLeaveForDay(day);
            const isToday = 
              day === today.getDate() && 
              month === today.getMonth() && 
              year === today.getFullYear();

            return (
              <div
                key={day}
                className={`calendar-cell ${leave ? "leave-cell" : ""} ${isToday ? "today" : ""}`}
                style={{
                  backgroundColor: leave ? getLeaveColor(leave.status) : "#f9fafb"
                }}
              >
                <span className="calendar-day">{day}</span>

                {leave && (
                  <span className="calendar-tooltip">
                    {leave.status} - {leave.leave_type}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Generate 3 months: previous, current, next
  const months = [
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-navigation">
        <button onClick={previousMonth} className="nav-btn">
          Previous
        </button>
        <button onClick={goToToday} className="nav-btn today-btn">
          Today
        </button>
        <button onClick={nextMonth} className="nav-btn">
          Next
        </button>
      </div>

      <div className="multi-month-view">
        {months.map(month => renderMonth(month))}
      </div>

      <div className="calendar-legend">
        <span><span className="legend-dot" style={{ background: "#10b981" }}></span> Approved</span>
        <span><span className="legend-dot" style={{ background: "#f59e0b" }}></span> Pending</span>
        <span><span className="legend-dot" style={{ background: "#f97316" }}></span> Priority Review</span>
        <span><span className="legend-dot" style={{ background: "#ef4444" }}></span> Rejected</span>
      </div>
    </div>
  );
}

export default CalendarView;
