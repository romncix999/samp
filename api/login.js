import mysql from 'mysql2/promise';
import CryptoJS from 'crypto-js'; // Khdem b-had l-import jdid

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { username, password } = req.body;

    // Hashing Whirlpool b-tariqa s7iha f Node.js
    const hashedPassword = CryptoJS.Whirlpool(password).toString(CryptoJS.enc.Hex).toUpperCase();

    try {
        const connection = await mysql.createConnection({
            host: "194.62.1.82",
            user: "u55_ouNpGG5dEz",
            password: "G!jrZk!3UqQqFZOWvej.Jitm",
            database: "s55_simo",
            port: 3306
        });

        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?', 
            [username, hashedPassword]
        );

        if (rows.length > 0) {
            const user = rows[0];
            delete user.password;
            res.status(200).json({ success: true, user: user });
        } else {
            res.status(401).json({ success: false, message: "Username awla Password ghalat" });
        }

        await connection.end();
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}