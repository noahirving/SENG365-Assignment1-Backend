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

exports.create = async function(authUser, req, res, next) {

    const title = req.body.title,
        description = req.body.description,
        categoryIds = req.body.categoryIds,
        date = req.body.date || new Date().toISOString(),
        isOnline = req.body.isOnline,
        url = req.body.url,
        venue = req.body.venue,
        capacity = req.body.capacity,
        requiresAttendanceControl = req.body.requiresAttendanceControl,
        fee = req.body.fee;

    try {
        const categoriesCount = await Events.countCategories(categoryIds);
        if (categoryIds.length != categoriesCount) {
            next(BadRequest('categoriesIds not valid'));
        } /*else if (date /*&& date > current date*) {

        }*/ else {
            let data = {
                title: title,
                description: description,
                date: date,
                organizer_id: authUser.id
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

exports.getOne = async function(req, res, next) {
    console.log('Request to get an event...');

    const id = req.params.id;
    try {
        const [event] = await Crud.read('event', {id: id});

        if (!event) next(BadRequest('event does not exist'));
        else {
            const event_categories = await Crud.read('event_category', {event_id: id});
            const categories = event_categories.map(event_category => event_category.category_id);
            const [organizer] = await Crud.read('user', {id: event.organizer_id});
            const numAcceptedAttendees = await  Events.countAcceptedAttendees(event.id);

            res.status(200).send({
                eventId: event.id,
                title: event.title,
                categories: categories,
                organizerFirstName: organizer.first_name,
                organizerLastName: organizer.last_name,
                numAcceptedAttendees: numAcceptedAttendees,
                capacity: event.capacity,
                description: event.description,
                organizerId: event.organizer_id,
                date: event.date.toISOString()
                    .replace('T', ' ')
                    .replace('Z', ''),
                isOnline: Boolean(event.is_online),
                url: event.url,
                venue: event.venue,
                requiresAttendanceControl: Boolean(event.requires_attendance_control),
                fee: parseFloat(event.fee)
            });
        }
    } catch (err) {
        next(err);
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
