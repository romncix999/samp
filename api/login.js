import mysql from 'mysql2/promise';

// Database dyal l-hadiyat m3a l-codes
const CODES_DATABASE = {
  "EC-A1F2-B3K9": { item: "سيارة Tahoma", id: 566 },
  "EC-Z7X4-M2P8": { item: "مبلغ 50,000$", id: 50000 },
  "EC-Q5R1-N6T3": { item: "سلاح AK-47", id: 30 }
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { username, code } = req.body;

    const reward = CODES_DATABASE[code];

    if (!reward) {
        return res.status(400).json({ success: false, message: "هذا الكود غير صحيح أو انتهت صلاحيته" });
    }

    try {
        const connection = await mysql.createConnection({
            host: "194.62.1.82",
            user: "u55_ouNpGG5dEz",
            password: "G!jrZk!3UqQqFZOWvej.Jitm",
            database: "s55_simo"
        });

        // 1. Check wach l-user deja khda l-hadiya
        const [user] = await connection.execute('SELECT web_gift FROM users WHERE username = ?', [username]);
        if (user.length > 0 && user[0].web_gift !== 0) {
            return res.status(400).json({ success: false, message: "لقد استلمت هدية بالفعل، ادخل للعبة لاستلامها" });
        }

        // 2. Update f SQL: n-sayvo l-ID dial l-hadiya f 'web_gift'
        // blast ma n-diro '1', n-diro l-ID (مثلاً 566 dial Tahoma)
        await connection.execute('UPDATE users SET web_gift = ? WHERE username = ?', [reward.id, username]);
        
        await connection.end();

        // 3. N-rj3o l-smiya dial l-hadiya l-site
        res.status(200).json({ 
            success: true, 
            message: `مبروك! لقد حصلت على ${reward.item}`,
            item: reward.item 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}