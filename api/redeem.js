import mysql from 'mysql2/promise';

const VALID_CODES = ["EC-A1F2-B3K9", "EC-Z7X4-M2P8", "EC-Q5R1-N6T3"]; // Zid l-codes dyalk hna

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { username, code } = req.body;

    if (!VALID_CODES.includes(code)) {
        return res.status(400).json({ success: false, message: "كود غير صحيح" });
    }

    try {
        const connection = await mysql.createConnection({
            host: "194.62.1.82",
            user: "u55_ouNpGG5dEz",
            password: "G!jrZk!3UqQqFZOWvej.Jitm",
            database: "s55_simo"
        });

        // Update web_gift bash SAMP i-3tih l-tomobil
        await connection.execute('UPDATE users SET web_gift = 1 WHERE username = ?', [username]);
        
        await connection.end();
        res.status(200).json({ success: true, message: "تم تفعيل الكود بنجاح! ادخل للعبة الآن" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}