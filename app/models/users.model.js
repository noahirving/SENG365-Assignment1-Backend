const db = require('../../config/db');
const crud = require('./crud');

exports.create = async function (data) {

    return await crud.create('user', data);
}

exports.read = async function (fields) {
    console.log(fields);

    return await crud.read('user', fields);
}

exports.update = async function (data, id) {

    return await crud.update('user', data, id);
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