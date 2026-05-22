const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken'); 

// (In a real enterprise app, this secret key goes in a hidden .env file, 
// but for your local development, we will define it here)
const JWT_SECRET = "uog_care_super_secret_key_2026";

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to receive JSON data from React
const db = require('./db'); // Plugs into your new database file!

// A simple test API endpoint
app.get('/api/medicines', (req, res) => {
    db.query("SELECT * FROM medicines", (err, result) => {
        if (err) {
            res.status(500).send("Error fetching medicines");
        } else {
            res.json(result);
        }
    });
});

const nodemailer = require('nodemailer');

// --- EMAIL SETUP ---
// REPLACE THESE TWO LINES WITH YOUR REAL GMAIL AND APP PASSWORD!
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'curelink72@gmail.com',
        pass: 'lrss wluq ugri fxun'       
    }
});

// A GET API to fetch all incoming orders for the Admin Dashboard
app.get('/api/orders', (req, res) => {
    // This SQL query joins 3 tables together to get the complete order summary!
    const sql = `
        SELECT 
            o.id, o.customer_name, o.phone, o.address, o.total_amount, o.order_date, o.status, o.payment_method,
            GROUP_CONCAT(CONCAT(oi.quantity, 'x ', m.name) SEPARATOR ', ') as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN medicines m ON oi.medicine_id = m.id
        GROUP BY o.id
        ORDER BY o.order_date DESC;
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Failed to fetch orders.");
        } else {
            res.status(200).json(results);
        }
    });
});

// A PUT API to update the status of an order
app.put('/api/orders/:id/status', (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body; // Expects "Delivered" or "Cancelled"

    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(sql, [status, orderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Failed to update order status.");
        }
        res.status(200).json({ message: "Order status updated successfully!" });
    });
});

// --- UPGRADED: ADD NEW MEDICINE ROUTE ---
app.post('/api/medicines', (req, res) => {
    const { name, category, price, stock_quantity, batch_number, description, formula } = req.body;
    const q = "INSERT INTO medicines (name, category, price, stock_quantity, batch_number, description, formula) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const finalFormula = formula || 'General';

    db.query(q, [name, category, price, stock_quantity, batch_number, description, finalFormula], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to add medicine" });
        }
        return res.json({ message: "Medicine added successfully!", id: data.insertId });
    });
});

// A POST API to process customer checkout
app.post('/api/orders', (req, res) => {
    const { customer_name, phone, address, total_amount, payment_method, cart_items } = req.body;
    const orderSql = "INSERT INTO orders (customer_name, phone, address, total_amount, payment_method) VALUES (?, ?, ?, ?, ?)";
    
    db.query(orderSql, [customer_name, phone, address, total_amount, payment_method], (err, orderResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Database error while creating order.");
        }

        const newOrderId = orderResult.insertId;
        const itemSql = "INSERT INTO order_items (order_id, medicine_id, quantity, price) VALUES ?";
        const itemValues = cart_items.map(item => [newOrderId, item.id, item.quantity, item.price]);

        db.query(itemSql, [itemValues], (err, itemResult) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Database error while saving order items.");
            }
            res.status(201).json({ message: "Order placed successfully!", orderId: newOrderId });
        });
    });
});

// A POST API for Admin Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.status(200).json({ message: "Login successful", token: "uog-secure-admin-pass-101" });
    } else {
        res.status(401).send("Invalid username or password");
    }
});

// A DELETE API to remove a medicine from the inventory
app.delete('/api/medicines/:id', (req, res) => {
    const medicineId = req.params.id;
    const sql = "DELETE FROM medicines WHERE id = ?";
    db.query(sql, [medicineId], (err, result) => {
        if (err) {
            if (err.errno === 1451) {
                return res.status(400).send("Cannot delete this medicine because it is part of an existing customer order. Try updating its stock to 0 instead.");
            }
            console.error(err);
            return res.status(500).send("Failed to delete medicine.");
        }
        res.status(200).json({ message: "Medicine deleted successfully!" });
    });
});

// --- UPGRADED: EDIT EXISTING MEDICINE ROUTE ---
app.put('/api/medicines/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, price, stock_quantity, batch_number, description, formula } = req.body;
    const q = "UPDATE medicines SET name=?, category=?, price=?, stock_quantity=?, batch_number=?, description=?, formula=? WHERE id=?";
    const finalFormula = formula || 'General';

    db.query(q, [name, category, price, stock_quantity, batch_number, description, finalFormula, id], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update medicine" });
        }
        return res.json({ message: "Medicine updated successfully!" });
    });
});

// A GET API for customers to track their specific order
app.get('/api/orders/:id', (req, res) => {
    const orderId = req.params.id;
    const sql = "SELECT status, order_date FROM orders WHERE id = ?";
    
    db.query(sql, [orderId], (err, result) => {
        if (err) return res.status(500).send("Database error.");
        if (result.length === 0) return res.status(404).send("Order not found.");
        res.status(200).json(result[0]);
    });
});


// ==========================================
// UPGRADED AUTHENTICATION: SIGNUP ROUTE (WITH OTP)
// ==========================================
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    try {
        const checkUserQuery = "SELECT * FROM users WHERE email = ?";
        db.query(checkUserQuery, [email], async (err, results) => {
            if (err) return res.status(500).json({ error: "Internal server error" });
            if (results.length > 0) return res.status(400).json({ error: "Email already in use. Please log in." });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 1. Generate a 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // 2. Insert user with the OTP code
            const insertUserQuery = "INSERT INTO users (name, email, password, phone, address, role, verification_code) VALUES (?, ?, ?, ?, ?, 'customer', ?)";
            db.query(insertUserQuery, [name, email, hashedPassword, phone, address, otpCode], (err, result) => {
                if (err) return res.status(500).json({ error: "Failed to register user" });

                // 3. Send the Email
                const mailOptions = {
                    from: transporter.options.auth.user, 
                    to: email,
                    subject: 'CureLink Pharmacy - Verify Your Account',
                    html: `
                        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                            <h2 style="color: #0f172a;">Welcome to CureLink!</h2>
                            <p style="font-size: 16px; color: #334155;">To complete your registration, please use the verification code below:</p>
                            <h1 style="color: #2563eb; letter-spacing: 5px; background: #f8fafc; padding: 15px; border-radius: 8px; display: inline-block;">${otpCode}</h1>
                            <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If you did not request this, please ignore this email.</p>
                        </div>
                    `
                };

                transporter.sendMail(mailOptions, (mailErr, info) => {
                    if (mailErr) console.log("Email error: ", mailErr);
                    res.status(201).json({ 
                        message: "Signup successful! Please check your email for the OTP.", 
                        userId: result.insertId 
                    });
                });
            });
        });
    } catch (error) {
        console.error("Signup Catch Error:", error);
        res.status(500).json({ error: "Server encountered an error during signup" });
    }
});


// ==========================================
// NEW: OTP VERIFICATION ROUTE
// ==========================================
app.post('/api/auth/verify-otp', (req, res) => {
    const { userId, otp } = req.body;

    const query = 'SELECT verification_code FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ error: "User not found" });

        const correctOtp = results[0].verification_code;

        if (correctOtp === otp) {
            // Success! Set verified to true and clear the code
            db.query('UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE id = ?', [userId], (updateErr) => {
                if (updateErr) return res.status(500).json({ error: "Database error" });
                res.status(200).json({ message: "Account successfully verified! You can now log in." });
            });
        } else {
            res.status(400).json({ error: "Invalid verification code" });
        }
    });
});


// ==========================================
// UPGRADED AUTHENTICATION: LOGIN ROUTE
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const findUserQuery = "SELECT * FROM users WHERE email = ?";
        db.query(findUserQuery, [email], async (err, results) => {
            if (err) return res.status(500).json({ error: "Internal server error" });
            if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

            const user = results[0]; 

            // --- SECURITY CHECK: Are they verified? ---
            if (!user.is_verified) {
                return res.status(403).json({ error: "Account not verified. Please check your email for the OTP code." });
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) return res.status(401).json({ error: "Invalid email or password" });

            const token = jwt.sign(
                { userId: user.id, role: user.role }, 
                JWT_SECRET, 
                { expiresIn: '24h' }
            );

            res.status(200).json({
                message: "Login successful!",
                token: token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,   
                    address: user.address
                }
            });
        });
    } catch (error) {
        console.error("Login Catch Error:", error);
        res.status(500).json({ error: "Server encountered an error during login" });
    }
});

// --- PRICE COMPARISON ALGORITHM ROUTE ---
app.get('/api/medicines/alternatives', (req, res) => {
    const { formula, excludeId } = req.query;
    const q = "SELECT * FROM medicines WHERE formula = ? AND id != ? AND stock_quantity > 0 ORDER BY price ASC LIMIT 3";
    db.query(q, [formula, excludeId], (err, data) => {
        if (err) return res.status(500).json({ error: "Algorithm failed" });
        return res.json(data);
    });
});

// 1. Make the uploads folder publicly readable
app.use('/uploads', express.static('uploads'));

// 2. Import your new clean routes file
const prescriptionRoutes = require('./routes/prescriptions');

// 3. Tell the server to use it for any /api/prescriptions requests
app.use('/api/prescriptions', prescriptionRoutes);

// Start the server
app.listen(8080, () => {
    console.log('Node.js Server is running on port 8080');
});