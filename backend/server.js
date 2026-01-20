const express = require("express");
const cors = require("cors");
const path = require("path");

const leaveRoutes = require("./routes/leaveRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API ROUTES
app.use("/api/leaves", leaveRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// SERVE FRONTEND (Production only)
const buildPath = path.join(__dirname, "build");
const fs = require("fs");

// Only serve static files if build folder exists
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  
  // React fallback routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// START SERVER
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is busy. Trying ${PORT + 1}...`);
    app.listen(PORT + 1, () => {
      console.log(`Server running on http://localhost:${PORT + 1}`);
    });
  }
});
