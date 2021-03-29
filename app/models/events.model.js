const db = require('../../config/db');


exports.search = async function(startIndex, count, q, categoryIds, organizerId, sortBy) {
    console.log(`Request to search for ${count} events starting from the ${startIndex} result...`)

    const conn = await db.getPool();
    const query = `
    select e.id, e.title
    from event e
    where
    (title like $3 or description like $3)
    order by e.id
    limit $1, $2`;
    const [results] = await conn.query(query, [parseInt(startIndex), parseInt(count), q]);
    return results;
};

exports.selectOne = async function(id) {
    console.log(`Request to select event '${id}'...`);

    const conn = await db.getPool();
    const query = 'select * from event where id = ?';
    const [result] = await conn.query(query, [id]);

    return result;
}

exports.countCategories = async function(ids) {
    console.log('Request to count category ids...');

    let query = `
    select count(*) as count
    from category
    where id in (`

    for (let i = 0; i < ids.length; i++) {
        if (i > 0) query += ', ';
        query += '?';
    }
    query += ')';

    const conn = await db.getPool();
    const [[result]] = await conn.query(query, ids);
    return result.count;

}