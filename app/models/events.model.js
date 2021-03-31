const db = require('../../config/db');


exports.search = async function(data) {
    console.log(`Request to search for ${count} events starting from the ${startIndex} result...`)

    const {startIndex, count, q, categoryIds, organizerId, sortBy} = data;

    const conn = await db.getPool();
    let params = [];
    let query = `
    select e.id, e.title
    from event e`;
    //if (categoryIds.length > 0) query += ' inner join '
    query += ` where`;
    if (q) {
        query += ' (title like ? or description like ?) ';
        params.push(q);
        params.push(q);
    }
    /*
    if (categoryIds.length !== 0) {
        if (params.length > 0) query += ' and ';
        query += ''
    }*/

    query += ' order by ?';
    params.push(sortBy);
    if (organizerId !== undefined) {
        if (params.length > 0) query += ' and ';
        query += ' organizer_id = ? ';
        params.push(organizerId);
    }
    if (startIndex !== undefined && count !== undefined) {
        query += ' limit ?, ? ';
        params.push(startIndex, count);
    } else if (startIndex !== undefined) {
        query += ' limit ?, 18446744073709551615 ';
        params.push(startIndex);
    } else if (count !== undefined) {
        query += ' limit ?';
        params.push(count);
    }


    const [result] = await conn.query(query, params);

    `limit $1, $2`;
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

exports.countAcceptedAttendees = async function(eventId){
    console.log('Request to count accepted attendees in event...');

    let query = `
    select count(*) as count
    from event_attendees
    where attendance_status_id = 1
    and event_id = ?`; //1 is accepted status

    const conn = await db.getPool();
    const [[result]] = await conn.query(query, [eventId]);
    return result.count;
}

exports.readAttendees = async function(isOrganizer, event_id, auth_id) {
    console.log(`Request to read attendees...`);

    let params = [event_id];
    let query = `
    select ea.id, ea.attendance_status_id, u.first_name, u.last_name, ea.date_of_interest
    from event_attendees ea
    inner join user u on ea.user_id = u.id 
    where `;
    if (!isOrganizer) query += '(event_id = ? and attendance_status_id = 1)'; // 1 for accepted
    else query += 'event_id = ?';

    if (auth_id) {
        query += ' or (event_id = ? and user_id = ?)';
        params.push(event_id);
        params.push(auth_id);
    }
    query += ' order by date_of_interest';

    console.log(query);
    console.log(params);
    const conn = await db.getPool();
    const [results] = await conn.query(query, params);
    return results;
}



