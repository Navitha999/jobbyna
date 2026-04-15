const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cors = require("cors");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const jwtSecret = process.env.JWT_SECRET || "MY_SECRET_TOKEN";

// 🔹 JWT Verification Middleware
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
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

let db = null;

// 🔹 Server + DB connection
const serverCreation = async () => {
  try {
    const connection = await mysql.createConnection(process.env.MY_SQL_URL);
    db = connection;

    console.log("Database connected successfully! ✅");

    // ✅ Create jobs table
    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        rating INT NOT NULL,
        company_logo_url TEXT,
        company_website_url TEXT,
        location VARCHAR(255),
        job_description TEXT,
        employment_type VARCHAR(255),
        package_per_annum VARCHAR(255)
      )
    `;
    await db.query(createJobsTable);

    // ✅ Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
    await db.query(createUsersTable);

    // ✅ FIXED: Bind to 0.0.0.0
    const port = process.env.PORT || 3000;

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port} 🚀`);
    });

  } catch (err) {
    console.log(`Connection Error: ${err.message}`);
    process.exit(1);
  }
};

serverCreation();

// 🔹 REGISTER API
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username & password required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 chars" });
  }

  try {
    const checkUser = "SELECT * FROM users WHERE username = ?";
    const [rows] = await db.query(checkUser, [username]);

    if (rows.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUser = `INSERT INTO users (username, password) VALUES (?, ?)`;

    await db.query(insertUser, [username, hashedPassword]);

    res.status(201).json({ message: "User registered successfully ✅" });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 LOGIN API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const getUser = "SELECT * FROM users WHERE username = ?";
    const [rows] = await db.query(getUser, [username]);
    const dbUser = rows[0];

    if (!dbUser) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password);

    if (isMatch) {
      const token = jwt.sign({ username: dbUser.username }, jwtSecret);
      res.json({ message: "Login success ✅", jwt_token: token });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔹 GET JOBS API
app.get("/jobs", verifyToken, async (req, res) => {
  try {
    const { employment_type, minimum_package, search } = req.query;

    let query = "SELECT * FROM jobs WHERE 1=1";
    const params = [];

    if (employment_type) {
      const types = employment_type.split(",").map(type => type.trim());
      query += ` AND employment_type IN (${types.map(() => "?").join(",")})`;
      params.push(...types);
    }

    if (minimum_package) {
      const minPackageNum = parseInt(minimum_package);
      query += " AND CAST(SUBSTRING_INDEX(package_per_annum, ' ', 1) AS UNSIGNED) >= ?";
      params.push(minPackageNum);
    }

    if (search) {
      query += " AND (title LIKE ? OR job_description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [jobs] = await db.query(query, params);
    res.json(jobs);

  } catch (err) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
});

// 🔹 GET JOB BY ID
app.get("/jobs/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const query = "SELECT * FROM jobs WHERE id = ?";
    const [job] = await db.query(query, [id]);

    if (job.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job[0]);

  } catch (err) {
    res.status(500).json({ message: "Error fetching job" });
  }
});