const express = require("express");
const fs = require("fs");
const dns = require("dns");

const app = express();


// GET /students
// Returns all students
app.get("/students", (req, res) => {
    const data = fs.readFileSync("students.json", "utf-8");
    const students = JSON.parse(data);
    res.json(students);
});


// GET /students/:id
// Returns a student based on ID
app.get("/students/:id", (req, res) => {

    const data = fs.readFileSync("students.json", "utf-8");

    const students = JSON.parse(data);

    const id = parseInt(req.params.id);

    const student = students.find(s => s.id === id);

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    res.json(student);
});


// GET /search?course=Node.js
// Searches students by course
app.get("/search", (req, res) => {

    const course = req.query.course;

    const data = fs.readFileSync("students.json", "utf-8");

    const students = JSON.parse(data);

    const result = students.filter(
        student => student.course.toLowerCase() === course.toLowerCase()
    );

    res.json(result);
});


// GET /system
// Returns system information
app.get("/system", (req, res) => {

    res.json({
        platform: process.platform,
        architecture: process.arch,
        nodeVersion: process.version,
        processId: process.pid
    });
});


// GET /dns
// Performs DNS lookup
app.get("/dns", (req, res) => {

    dns.lookup("google.com", (err, address, family) => {

        if (err) {
            return res.status(500).json({
                message: "DNS lookup failed"
            });
        }

        res.json({
            hostname: "google.com",
            address: address,
            family: family
        });
    });
});


// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});