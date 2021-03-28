const db = require('../../config/db');

exports.create = async function (firstName, lastName, email, password) {
    console.log(`Request to create user '${firstName} ${lastName}', '${email}'...`);
    const conn = db.getPool();
    const query = `
    insert into user (first_name, last_name, email, password)
    values (?, ?, ?, ?)`;
    const [result] = await conn.query(query, [firstName, lastName, email, password]);
    return result;
}

exports.read = async function (fields) {

    const conn = await db.getPool();
    let query = `
    select *
    from user
    where `;
    let params = []
    for (key in fields) {
        if (params.length > 0) query += ' and ';
        query += '?? = ?';
        params.push(key);
        params.push(fields[key]);
    }
    const [result] = await conn.query(query, params);
    return result;
}

exports.update = async function (data, id) {

    const conn = await db.getPool();
    let query = `
    update user
    set `;
    let params = [];
    for (key in data) {
        if (key == 'id') continue;
        if (params.length > 0) query += ', ';
        query += '?? = ?';
        params.push(key);
        params.push(fields[key]);
    }
    query += `
    where id = `;
    params.push(id);

    const [result] = await conn.query(query, params);
    return result;
}

exports.emailExists = async function (email) {
    console.log(`Checking if email '${email} exists...`);

    const conn = await db.getPool();
    const query = `
        select *
        from user
        where email = ?`;
    const [results] = await conn.query(query, [email]);
    return results.length > 0;
}