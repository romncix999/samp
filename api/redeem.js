import mysql from 'mysql2/promise';

const DB_CONFIG = {
    host: "194.62.1.82",
    user: "u55_ouNpGG5dEz",
    password: "G!jrZk!3UqQqFZOWvej.Jitm",
    database: "s55_simo"
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { username, code } = req.body;
    const cleanCode = code.trim().toUpperCase();

    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);

        // 1. تقليب واش الكود كاين في الجدول الديناميكي
        const [codeRows] = await connection.execute(
            'SELECT reward_id, reward_type FROM dynamic_codes WHERE code = ?', 
            [cleanCode]
        );

        if (codeRows.length === 0) {
            return res.status(400).json({ success: false, message: 'الكود غير صحيح أو انتهى!' });
        }

        const reward = codeRows[0];

        // 2. واش المستخدم موجود؟
        const [userCheck] = await connection.execute('SELECT uid, web_gift FROM users WHERE username = ?', [username]);
        if (userCheck.length === 0) return res.status(404).json({ success: false, message: 'المستخدم غير موجود!' });

        const playerUID = userCheck[0].uid;
        if (parseInt(userCheck[0].web_gift) !== 0) {
            return res.status(400).json({ success: false, message: 'عندك هدية كتسناك فـ /box!' });
        }

        // 3. تحديث الهدية (web_gift غيهز الـ ID نيشان)
        await connection.execute('UPDATE users SET web_gift = ? WHERE uid = ?', [reward.reward_id, playerUID]);

        // 4. مسح الكود من الجدول باش ما يتعاودش (One time use)
        await connection.execute('DELETE FROM dynamic_codes WHERE code = ?', [cleanCode]);

        let typeMsg = reward.reward_type === 'VEH' ? "سيارة" : (reward.reward_type === 'MONEY' ? "مبلغ مالي" : "Level");
        
        return res.status(200).json({ 
            success: true, 
            message: `مبروك! حصلت على ${typeMsg}. دخل للعبة ودير /box` 
        });

    } catch (e) {
        return res.status(500).json({ success: false, message: 'Error: ' + e.message });
    } finally {
        if (connection) await connection.end();
    }
}
