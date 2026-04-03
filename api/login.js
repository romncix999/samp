import mysql from 'mysql2/promise';

const DB = {
  host: "194.62.1.82",
  user: "u55_ouNpGG5dEz",
  password: "G!jrZk!3UqQqFZOWvej.Jitm",
  database: "s55_simo"
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: 'بيانات ناقصة' });

  let connection;
  try {
    connection = await mysql.createConnection(DB);

    const [rows] = await connection.execute(
      'SELECT uid, username, level, exp, cash, bank, ecoin, diamonds, health, armor, hours, minutes, adminlevel, adminname, helperlevel, faction, gang, factionrank, gangrank, jailtime, jailtype, vippackage, wantedlevel, regdate, lastlogin, job, secondjob, web_gift FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      // ما نرجعوش password فالرد
      const user = rows[0];
      res.status(200).json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'إسم المستخدم أو كلمة السر غلط' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (connection) await connection.end();
  }
}
