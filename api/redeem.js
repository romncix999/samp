import mysql from 'mysql2/promise';

const REWARDS_LIST = {
    "//EC-A1F2-B3K9": { name: "سيارة Tahoma", id: 566 },
    "//EC-Z7X4-M2P8": { name: "مبلغ 50,000$", id: 50000 },
    "//EC-Q5R1-N6T3": { name: "Level +1", id: 1 }
};

const DB_CONFIG = {
    host: "194.62.1.82",
    user: "u55_ouNpGG5dEz",
    password: "G!jrZk!3UqQqFZOWvej.Jitm",
    database: "s55_simo"
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { username, code } = req.body; // الموقع كيصيفط السمية
    const cleanCode = code.trim().toUpperCase();
    const reward = REWARDS_LIST[cleanCode];

    if (!reward) return res.status(400).json({ success: false, message: 'الكود غير صحيح!' });

    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        // 1. كنجيبو الـ pID ديال اللاعب من السمية ديالو
        const [userCheck] = await connection.execute('SELECT pID, web_gift FROM users WHERE username = ?', [username]);
        
        if (userCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود في القاعدة!' });
        }

        const playerID = userCheck[0].pID;
        const currentGift = parseInt(userCheck[0].web_gift);

        // 2. واش الكود مستعمل؟
        const [used] = await connection.execute('SELECT id FROM used_codes WHERE code = ?', [cleanCode]);
        if (used.length > 0) return res.status(400).json({ success: false, message: 'هاد الكود تخدم من قبل!' });

        // 3. واش الصندوق عامر؟ (هنا فين كان المشكل)
        if (currentGift !== 0) {
            return res.status(400).json({ success: false, message: 'عندك هدية كتسناك فـ /box! خودها هي الأولى.' });
        }

        // 4. تسجل الهدية باستعمال pID
        await connection.execute('UPDATE users SET web_gift = ? WHERE pID = ?', [reward.id, playerID]);
        await connection.execute('INSERT INTO used_codes (code, username) VALUES (?, ?)', [cleanCode, username]);

        res.status(200).json({ success: true, message: `مبروك! حصلت على ${reward.name}` });
    } catch (e) {
        res.status(500).json({ success: false, message: 'Error: ' + e.message });
    } finally {
        if (connection) await connection.end();
    }
}
