import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { username, password } = req.body;

    try {
        const connection = await mysql.createConnection({
            host: "194.62.1.82",
            user: "u55_ouNpGG5dEz",
            password: "G!jrZk!3UqQqFZOWvej.Jitm",
            database: "s55_simo"
        });

        // Query bash n-qarno l-ma3loumat
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?', 
            [username, password]
        );

        if (rows.length > 0) {
            res.status(200).json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: "Username awla Password ghalat" });
        }
        await connection.end();
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}