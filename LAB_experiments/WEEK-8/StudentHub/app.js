// ============================================================
// StudentHub - Student Management System
// Backend Server (Node.js + Express.js)
// ============================================================
// This file is the entire backend. It:
//   1. Serves the static frontend files from the "public" folder
//   2. Accepts registration data and saves it to users.json
//   3. Accepts login data, checks it against users.json
// users.json acts as our simple "database" for this academic project.
// ============================================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, "users.json");

// ------------------------------------------------------------
// MIDDLEWARE
// ------------------------------------------------------------
// Parses incoming JSON request bodies (used by our fetch() calls)
app.use(express.json());
// Parses incoming URL-encoded bodies (regular HTML form submissions)
app.use(express.urlencoded({ extended: true }));
// Serves everything inside /public directly (index.html, css, js, etc.)
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------------------------
// HELPER FUNCTIONS — reading and writing users.json
// ------------------------------------------------------------

/**
 * Reads users.json and returns a Promise that resolves to an array of users.
 * If the file is missing or empty/corrupted, we resolve to an empty array
 * instead of crashing the server.
 */
function readUsers() {
  return new Promise((resolve, reject) => {
    fs.readFile(USERS_FILE, "utf8", (err, data) => {
      if (err) {
        // If the file simply doesn't exist yet, treat it as "no users"
        if (err.code === "ENOENT") {
          return resolve([]);
        }
        return reject(err);
      }
      try {
        const trimmed = data.trim();
        const users = trimmed.length === 0 ? [] : JSON.parse(trimmed);
        resolve(users);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

/**
 * Writes the given users array back to users.json, pretty-printed.
 * Returns a Promise that resolves when the write is complete.
 */
function writeUsers(users) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(users, null, 4);
    fs.writeFile(USERS_FILE, json, "utf8", (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

/** Very small helper to check a reasonably valid email shape. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------

// GET / -> landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GET /register -> registration page
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

// GET /login -> login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ------------------------------------------------------------
// POST /register — create a new student account
// ------------------------------------------------------------
app.post("/register", async (req, res) => {
  try {
    const {
      name,
      age,
      dob,
      gender,
      email,
      mobile,
      username,
      password,
      address,
      course,
      year,
    } = req.body;

    // ---- Backend validation (never trust the frontend alone) ----
    const requiredFields = {
      name,
      age,
      dob,
      gender,
      email,
      mobile,
      username,
      password,
      address,
      course,
      year,
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || String(value).trim() === "") {
        return res.status(400).json({
          success: false,
          message: `Field "${field}" is required.`,
        });
      }
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const mobileDigits = String(mobile).replace(/\D/g, "");
    if (mobileDigits.length < 7 || mobileDigits.length > 15) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid mobile number.",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const ageNumber = Number(age);
    if (Number.isNaN(ageNumber) || ageNumber < 10 || ageNumber > 100) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid age.",
      });
    }

    // ---- Read existing users, preserving anyone already registered ----
    const users = await readUsers();

    // ---- Duplicate checks ----
    const usernameTaken = users.some(
      (u) => u.username.toLowerCase() === String(username).toLowerCase()
    );
    if (usernameTaken) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const emailTaken = users.some(
      (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );
    if (emailTaken) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ---- Build the new student record ----
    const newUser = {
      name: String(name).trim(),
      age: ageNumber,
      dob,
      gender,
      email: String(email).trim(),
      mobile: mobileDigits,
      username: String(username).trim(),
      password: String(password), // NOTE: stored in plain text intentionally for this academic project
      address: String(address).trim(),
      course: String(course).trim(),
      year: String(year).trim(),
    };

    // ---- Append to the array (existing students are never removed) ----
    users.push(newUser);
    await writeUsers(users);

    return res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (err) {
    console.error("Error in POST /register:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while registering. Please try again.",
    });
  }
});

// ------------------------------------------------------------
// POST /login — validate credentials using username OR email
// ------------------------------------------------------------
app.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email and password are required.",
      });
    }

    const users = await readUsers();
    const idLower = String(identifier).trim().toLowerCase();

    const matchedUser = users.find(
      (u) =>
        u.username.toLowerCase() === idLower || u.email.toLowerCase() === idLower
    );

    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    if (matchedUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // Do not send the password back to the browser
    const { password: _pw, ...safeUser } = matchedUser;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: safeUser,
    });
  } catch (err) {
    console.error("Error in POST /login:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while logging in. Please try again.",
    });
  }
});

// ------------------------------------------------------------
// Fallback 404 handler for unknown routes
// ------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ------------------------------------------------------------
// START SERVER
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`StudentHub server running at http://localhost:${PORT}`);
});
