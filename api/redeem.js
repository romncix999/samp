import mysql from 'mysql2/promise';

// Hna kat-7te l-codes u chnu l-hadiya dyalhom
const REWARDS = {
    "EC-A1F2-B3K9": { name: "سيارة Tahoma", id: 566, type: "vehicle" },
    "EC-Z7X4-M2P8": { name: "مبلغ 50,000$", id: 50000, type: "money" },
    "EC-Q5R1-N6T3": { name: "Level +1", id: 1, type: "level" }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { username, code } = req.body;

    const gift = REWARDS[code];
    if (!gift) return res.status(400).json({ success: false, message: "الكود غير صحيح!" });

    try {
        const connection = await mysql.createConnection({
            host: "194.62.1.82",
            user: "u55_ouNpGG5dEz",
            password: "G!jrZk!3UqQqFZOWvej.Jitm",
            database: "s55_simo"
        });

        // Check wach player deja khda cadeau
        const [rows] = await connection.execute('SELECT web_gift FROM users WHERE username = ?', [username]);
        
        if (rows.length > 0 && rows[0].web_gift !== 0) {
            return res.status(400).json({ success: false, message: "لقد استلمت هدية بالفعل، ادخل للعبة!" });
        }

        // Tasjil l-ID dial l-hadiya f l-database
        await connection.execute('UPDATE users SET web_gift = ? WHERE username = ?', [gift.id, username]);

        await connection.end();
        res.status(200).json({ 
            success: true, 
            message: `مبروك! حصلت على ${gift.name}`,
            giftName: gift.name 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}