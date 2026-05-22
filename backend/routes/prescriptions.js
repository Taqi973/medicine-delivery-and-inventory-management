const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db'); // The two dots mean "go back one folder, then find db.js"

// IMPORTANT: You need to bring your database connection into this file.
// If your db connection is in another file, require it here. 
// For example: const db = require('../db'); 
// (Adjust this line based on how you connect to MySQL in your project!)

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/prescriptions/'); 
  },
  filename: function (req, file, cb) {
    cb(null, 'rx-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// THE UPDATED UPLOAD ENDPOINT
router.post('/upload', upload.single('prescriptionImage'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });

  // Grab the User ID that React is going to send us
  const userId = req.body.userId; 
  if (!userId) return res.status(401).json({ error: 'User must be logged in' });

  const filePath = `/uploads/prescriptions/${req.file.filename}`;
  
  // Save the record to MySQL AND attach it to the user_id
  const sql = "INSERT INTO prescriptions (file_path, status, user_id) VALUES (?, 'Pending', ?)";
  
  db.query(sql, [filePath, userId], (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ error: 'Failed to save to database' });
    }
    res.status(200).json({ message: 'Prescription uploaded successfully' });
  });
});

// THE UPDATED ADMIN FETCH ENDPOINT (Joins with the Users table)
router.get('/', (req, res) => {
  // This SQL grabs the prescription AND joins the user's name, phone, and address!
  const sql = `
    SELECT p.*, u.name as customer_name, u.phone, u.address 
    FROM prescriptions p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.upload_date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch prescriptions' });
    res.status(200).json(results);
  });
});

// A PUT API to let the Pharmacist mark a prescription as 'Reviewed' or 'Rejected'
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; 

  const sql = "UPDATE prescriptions SET status = ? WHERE id = ?";
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update status' });
    res.status(200).json({ message: 'Status updated successfully' });
  });
});

module.exports = router;