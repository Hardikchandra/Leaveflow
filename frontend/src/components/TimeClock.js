// src/components/TimeClock.js

import React, { useEffect, useState } from "react";

function TimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  const greeting =
    hours < 12
      ? "Good Morning"
      : hours < 18
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <div>
      <h4>{greeting}</h4>
      <p>{currentTime.toLocaleString()}</p>
    </div>
  );
}

export default TimeClock;
