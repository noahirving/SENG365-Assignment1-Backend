const db = require('../../config/db');


exports.search = async function(data) {
    console.log(`Request to search for events...`)

    const {startIndex, count, q, categoryIds, organizerId, sortBy} = data;

    const conn = await db.getPool();
    let params = [];
    let query = `
    select e.id, e.title, u.first_name, u.last_name, e.capacity,
        (select count (*) from event_attendees ea
        where ea.attendance_status_id = 1 and ea.event_id = e.id) as attendees
    from event e
    inner join user u on e.organizer_id = u.id `;
    if (q || categoryIds || organizerId) query += ` where `;
    if (categoryIds && categoryIds.length > 0) {
        query += ' exists (select * from event_category ec where ec.event_id = e.id and ec.category_id in ('
        for (const catId of categoryIds) {
            if (params.length > 0) query += ',';
            query += '?';
            params.push(catId);
        }
        query += ')) '
    }
    if (q) {
        if (params.length > 0) query += ' and ';
        query += ` (title like ? or description like ?) `;
        params.push(`%${q}%`, `%${q}%`);
    }


    if (organizerId !== undefined) {
        if (params.length > 0) query += ' and ';
        query += ' organizer_id = ? ';
        params.push(organizerId);
    }

    query += ` order by ${sortBy} `;

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


    console.log(query);
    console.log(params);
    const [results] = await conn.query(query, params);
    console.log(results);
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



