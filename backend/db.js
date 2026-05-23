require('dotenv').config();
const mysql = require('mysql2');

// Create Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Successfully connected to the uog_care_db MySQL database!');
});

// THIS IS THE MAGIC DOOR: It allows other files to use this connection
module.exports = db;