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

exports.read = async function () {

}

exports.update = async function () {

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