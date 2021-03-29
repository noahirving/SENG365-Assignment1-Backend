const Events = require('../models/events.model');
const Crud = require('../models/crud');

exports.list = async function(req, res) {
    console.log('Request to list events...');
    const startIndex = req.query.startIndex || 0;
    const count = req.query.count;
    const q = req.query.q;
    const categoryIds = req.query.categoryids;
    const organizerId = req.query.organizerId;
    const sortBy = req.query.sortby;

    //if count is 0 or missing throw bad request? should it have a default value?

    try {
        const results = await Events.search(startIndex, count, q, categoryIds, organizerId, sortBy);

        res.status(200)
            .send(results);
    } catch (err) {
        res.status(500)
            .send('Internal server error');
        console.log(err);
    }
}

exports.create = async function(req, res, next) {

    const title = req.body.title,
        description = req.body.description,
        categoryIds = req.body.categoryIds,
        isOnline = req.body.isOnline,
        url = req.body.url,
        venue = req.body.venue,
        capacity = req.body.capacity,
        requiresAttendanceControl = req.body.requiresAttendanceControl,
        fee = req.body.fee;
    let date = req.body.date;

    try {
        const categoriesCount = await Events.countCategories(categoryIds);
        if (categoryIds.length != categoriesCount) {
            next(BadRequest('categoriesIds not valid'));
        } /*else if (date /*&& date > current date*) {

        }*/ else {

            if (!date) {
                const currentDate = new Date();
                date = currentDate.getFullYear() + '-' + currentDate.getMonth() + '-' + currentDate.getDate();
            }
            const token = req.get('X-Authorization');

            const [result] = await Crud.read('user',{'auth_token': token});
            let data = {
                title: title,
                description: description,
                date: date,
                organizer_id: result.id
            }
            if (isOnline !== undefined) data.is_online = isOnline;
            if (url) data.url = url;
            if (venue) data.venue = venue;
            if (capacity) data.capacity = capacity;
            if (requiresAttendanceControl !== undefined) data.requires_attendance_control = requiresAttendanceControl;

            const newEvent = await Crud.create('event', data);
            for (const id of categoryIds) {
                await Crud.create('event_category', {
                    event_id: newEvent.insertId,
                    category_id: id
                });
            }

            res.status(201)
                .send({eventId: newEvent.insertId});
        }
    } catch (err) {
        next(err);
    }
}

exports.read = async function(req, res) {
    console.log('Request to read event...');

    const id = req.params.id;

    try {
        const result = await Events.selectOne(id);
        if (result.length === 0) {
            res.status(404)
                .send('Not Found');
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send('Internal Server Error');
        console.log(`ERROR reading event ${id}: ${err}`);
    }
}

exports.update = async function(req, res) {

}

exports.delete = async function(req, res) {

}

exports.listCategories = async function(req, res) {

}

function BadRequest(message) {
    const err = new Error(message);
    err.name = 'Bad Request';
    err.status = 400;
    return err;
}
