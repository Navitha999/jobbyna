const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Middleware
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// ❌ REMOVED: app.options("*", cors()); → this was crashing your app

// ✅ JWT Secret
const jwtSecret = process.env.JWT_SECRET || "MY_SECRET_TOKEN";

// 🔹 JWT Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

let db = null;

// 🔹 Server + DB Setup
const serverCreation = async () => {
  try {
    if (!process.env.MY_SQL_URL) {
      console.log("❌ MY_SQL_URL is missing");
    } else {
      const connection = await mysql.createConnection(process.env.MY_SQL_URL);
      db = connection;

      console.log("✅ Database connected");

      // Create tables
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL
        )
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS jobs (
          id VARCHAR(255) PRIMARY KEY,
          title VARCHAR(255),
          rating INT,
          company_logo_url TEXT,
          company_website_url TEXT,
          location VARCHAR(255),
          job_description TEXT,
          employment_type VARCHAR(255),
          package_per_annum VARCHAR(255)
        )
      `);
    }

  } catch (err) {
    console.log("⚠️ DB connection failed:", err.message);
  }

  // ✅ ALWAYS start server (important for Render)
  const port = process.env.PORT || 3000;

  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

serverCreation();

// 🔹 REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username & password required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 chars" });
  }

  try {
    if (!db) return res.status(500).json({ message: "DB not connected" });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully ✅" });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!db) return res.status(500).json({ message: "DB not connected" });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ username: user.username }, jwtSecret);

    res.json({ message: "Login success ✅", jwt_token: token });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 GET JOBS
app.get("/jobs", verifyToken, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ message: "DB not connected" });

    const { employment_type, minimum_package, search } = req.query;

    let query = "SELECT * FROM jobs WHERE 1=1";
    const params = [];

    // ✅ FIX 1: Normalize employment_type (robust)
    if (employment_type) {
      const normalizeType = (type) => {
        const t = type
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "")
          .replace(/_/g, "");

        const map = {
          fulltime: "Full Time",
          parttime: "Part Time",
          freelance: "Freelance",
          internship: "Internship",
        };

        return map[t];
      };

      const types = employment_type
        .split(",")
        .map(normalizeType)
        .filter(Boolean);

      if (types.length > 0) {
        query += ` AND employment_type IN (${types.map(() => "?").join(",")})`;
        params.push(...types);
      }
    }

    // ✅ FIX 2: Salary filter (LPA → rupees conversion)
    if (minimum_package) {
      query += `
        AND (
          CAST(SUBSTRING_INDEX(package_per_annum, ' ', 1) AS DECIMAL(10,2)) * 100000
        ) >= ?
      `;
      params.push(Number(minimum_package));
    }

    // ✅ FIX 3: Search filter
    if (search && search.trim() !== "") {
      query += " AND (title LIKE ? OR job_description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    // 🔍 Debug logs (optional)
    console.log("QUERY:", query);
    console.log("PARAMS:", params);

    const [jobs] = await db.query(query, params);
    res.json(jobs);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// 🔹 GET JOB BY ID
app.get("/jobs/:id", verifyToken, async (req, res) => {
  try {
    if (!db) return res.status(500).json({ message: "DB not connected" });

    const [job] = await db.query(
      "SELECT * FROM jobs WHERE id = ?",
      [req.params.id]
    );

    if (job.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job[0]);

  } catch (err) {
    res.status(500).json({ message: "Error fetching job" });
  }
});