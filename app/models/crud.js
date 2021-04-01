const db = require('../../config/db');

exports.create = async function (table, data) {
    console.log(`Request to create new ${table}...`);

    const conn = await db.getPool();
    let params = [table];
    let query = `
    insert into ?? (`;
    for (let key in data) {
        if (params.length > 1) query += ', ';
        query += '??';
        params.push(key);
    }
    query += `)
    values (`;

    const initialLength = params.length;
    for (let key in data) {
        if (params.length > initialLength) query += ', ';
        query += '?';
        params.push(data[key]);
    }
    query += ')';

    const [result] = await conn.query(query, params);
    return result;
}

exports.read = async function (table, fields) {
    console.log(`Request to read ${table}...`);

    const conn = await db.getPool();
    let params = [table]
    let query = `
    select *
    from ??`;
    if (fields) {
        query += `where `;
        for (let key in fields) {
            if (params.length > 1) query += ' and ';
            query += '?? = ?';
            params.push(key);
            params.push(fields[key]);
        }
    }

    //console.log(query);
    //console.log(params);
    const [results] = await conn.query(query, params);
    return results;
}

exports.update = async function (table, data, id) {
    console.log(`Request to update ${table}...`);

    const conn = await db.getPool();
    let params = [table];
    let query = `
    update ??
    set `;
    for (let key in data) {
        //if (key == Object.keys(id)[0]) continue;
        if (params.length > 1) query += ', ';
        query += '?? = ?';
        params.push(key);
        params.push(data[key]);
    }
    query += `
    where ?? = ?`;
    params.push(Object.keys(id)[0], Object.values(id)[0]);

    //console.log(query);
    //console.log(params);

    const [result] = await conn.query(query, params);
    return result;
}

exports.delete = async function(table, fields) {
    console.log(`Request to delete row/s from ${table}...`);

    const conn = await db.getPool();
    let params = [table]
    let query = `
    delete
    from ??`;
    if (fields) {
        query += `where `;
        for (let key in fields) {
            if (params.length > 1) query += ' and ';
            query += '?? = ?';
            params.push(key);
            params.push(fields[key]);
        }
    }

    //console.log(query);
    //console.log(params);
    const results = await conn.query(query, params);
    return results;
}