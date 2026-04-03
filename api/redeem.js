import mysql from 'mysql2/promise';

// ── CONFIGURATION ──
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

    const { username, code } = req.body;

    if (!username || !code) {
        return res.status(400).json({ success: false, message: 'Username awla Code naqas!' });
    }

    const cleanCode = code.trim().toUpperCase();
    const reward = REWARDS_LIST[cleanCode];

    if (!reward) {
        return res.status(400).json({ success: false, message: 'الكود غير صحيح!' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        // 1. Check wach l-user kayn u jib "id" dialu (machi pID)
        const [userCheck] = await connection.execute(
            'SELECT id, web_gift FROM users WHERE username = ?', 
            [username]
        );
        
        if (userCheck.length === 0) {
            return res.status(404).json({ success: false, message: 'المستخدم غير موجود!' });
        }

        const playerID = userCheck[0].id; // Hna l-muhim: sta3mlna "id"
        const currentGift = parseInt(userCheck[0].web_gift || 0);

        // 2. Check wach l-code m-sta3mel
        const [used] = await connection.execute(
            'SELECT id FROM used_codes WHERE code = ?', 
            [cleanCode]
        );
        if (used.length > 0) {
            return res.status(400).json({ success: false, message: 'هاد الكود تخدم من قبل!' });
        }

        // 3. Check wach l-box 3amer
        if (currentGift !== 0) {
            return res.status(400).json({ success: false, message: 'عندك هدية كتسناك فـ /box! خودها هي الأولى.' });
        }

        // 4. Update l-box dial l-player
        await connection.execute(
            'UPDATE users SET web_gift = ? WHERE id = ?', 
            [reward.id, playerID]
        );

        // 5. Sjel l-code ennu t-khdem
        await connection.execute(
            'INSERT INTO used_codes (code, username) VALUES (?, ?)', 
            [cleanCode, username]
        );

        return res.status(200).json({ 
            success: true, 
            message: `مبروك! حصلت على ${reward.name}. دخل للعبة واكتب /box.` 
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'خطأ: ' + e.message });
    } finally {
        if (connection) await connection.end();
    }
}
