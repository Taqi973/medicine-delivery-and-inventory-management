const fs = require('fs'); // Node's built-in File System tool
const csv = require('csv-parser'); // The tool we just installed
const mysql = require('mysql2');

// 1. Connect to your vault
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "world123!", // CHANGE THIS to your MySQL password!
    database: "uog_care_db"
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to database! Reading Kaggle CSV...");

    const medicinesToInsert = [];

    // 2. Open the CSV file and read it line by line
    fs.createReadStream('Pakistan Medicines Dataset.csv')
        .pipe(csv())
        .on('data', (row) => {
            // Combine Drug Name, Strength, and Form (e.g., "Panadol 500mg Tablet")
            const fullName = `${row['Drug Name']} ${row['Strength']} ${row['Form']}`.trim();
            
            // Extract the first word of the 'Indication' for our category (e.g., "Fever")
            let category = "General";
            if (row['Indication']) {
                category = row['Indication'].split(',')[0].trim();
            }

            // Create a rich description using the Kaggle data
            const description = `Mfg: ${row['Manufacturer']}. Treats: ${row['Indication']}. Warning: ${row['Side Effects']}`;

            // Some items in the CSV have a missing price (NaN). Let's catch that and assign a random price!
            let price = parseFloat(row['Price']);
            if (isNaN(price)) {
                price = Math.floor(Math.random() * 500) + 50; 
            }

            // Generate mock warehouse data for the simulation
            const stock = Math.floor(Math.random() * 500) + 20;
            const batch = `KAG-${Math.floor(Math.random() * 10000)}`;

            const year = Math.floor(Math.random() * (2030 - 2026 + 1)) + 2026;
            const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const expiry = `${year}-${month}-${day}`;

            // Add the perfectly formatted row to our array
            medicinesToInsert.push([fullName, category, description, price, stock, batch, expiry]);
        })
        .on('end', () => {
            console.log(`Successfully parsed ${medicinesToInsert.length} medicines from the CSV!`);

            // 3. Inject all the data into MySQL!
            const sql = "INSERT INTO medicines (name, category, description, price, stock_quantity, batch_number, expiry_date) VALUES ?";
            
            db.query(sql, [medicinesToInsert], (err, result) => {
                if (err) {
                    console.error("Error inserting data:", err);
                } else {
                    console.log(`✅ SUCCESS! Injected ${result.affectedRows} real Pakistani medicines into the vault!`);
                }
                db.end(); // Close connection
            });
        });
});