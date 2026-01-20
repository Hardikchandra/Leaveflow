// src/components/StatusBadge.js

import React from "react";

function StatusBadge({ status, color }) {
  const style = {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: color,
    color: "#fff",
    display: "inline-block"
  };

  return <span style={style}>{status}</span>;
}

export default StatusBadge;
