const db = require('../../config/db');

exports.selectOne = async function(id) {
    console.log(`Request to select event ${id}...`);

    const conn = await db.getPool().getConnection();
    const query = 'select * from events where eventId = ?';
    const [result] = conn.query(query, [id]);

    return result;

}