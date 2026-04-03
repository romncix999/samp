import mysql from 'mysql2/promise';

// ══════════════════════════════════════════════
//  ECLIPSE CITY - REDEEM SYSTEM
//  Hna kat-zid l-codes u chnu l-hadiya dialhom
// ══════════════════════════════════════════════
const REWARDS_LIST = {
    "//EC-A1F2-B3K9": { name: "سيارة Tahoma", id: 566 }, // Model ID dial Tahoma
    "//EC-Z7X4-M2P8": { name: "مبلغ 50,000$", id: 50000 },
    "//EC-Q5R1-N6T3": { name: "Level +1", id: 1 },
    "//EC-W8Y2-H4J7": { name: "سيارة Infernus", id: 411 }
};

const DB_CONFIG = {
    host: "194.62.1.82",
    user: "u55_ouNpGG5dEz",
    password: "G!jrZk!3UqQqFZOWvej.Jitm",
    database: "s55_simo"
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

    const { username, code } = req.body;

    if (!username || !code) {
        return res.status(400).json({ success: false, message: 'بيانات ناقصة (Username or Code missing)' });
    }

    const cleanCode = code.trim().toUpperCase();
    const reward = REWARDS_LIST[cleanCode];

    // 1. Check wach l-code s7i7
    if (!reward) {
        return res.status(400).json({ success: false, message: 'الكود غير صحيح أو غير موجود' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        // 2. Check wach l-code t-khdem mn qbel (f table used_codes)
        const [usedRows] = await connection.execute(
            'SELECT id FROM used_codes WHERE code = ?',
            [cleanCode]
        );

        if (usedRows.length > 0) {
            return res.status(400).json({ success: false, message: 'هاد الكود تخدم من قبل!' });
        }

        // 3. Check wach l-player 3ndo deja hadiya katsnah f l-box
        const [userRows] = await connection.execute(
            'SELECT web_gift FROM users WHERE username = ?',
            [username]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود في قاعدة البيانات' });
        }

        // Ila lqina web_gift kber mn 0, ya3ni rah baqi makhdach l-hadiya l-qdima
        if (userRows[0].web_gift > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'عندك هدية كتسناك فـ /box! خودها هي الأولى عاد دخل كود آخر.' 
            });
        }

        // 4. UPDATE l-hadiya l-jdida f table users
        await connection.execute(
            'UPDATE users SET web_gift = ? WHERE username = ?',
            [reward.id, username]
        );

        // 5. INSERT l-code f used_codes bash may-t-3awdch
        await connection.execute(
            'INSERT INTO used_codes (code, username) VALUES (?, ?)',
            [cleanCode, username]
        );

        return res.status(200).json({
            success: true,
            message: `مبروك! حصلت على ${reward.name}. دخل للعبة واكتب /box باش تاخدها.`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'خطأ في الاتصال بقاعدة البيانات', error: error.message });
    } finally {
        if (connection) await connection.end();
    }
}
