const Events = require('../models/events.model');
const Crud = require('../models/crud');
const {getAuthUser} = require("../middleware/authorize");
const {NotFound, BadRequest, Forbidden, Unauthorized} = require("../middleware/http-errors");

exports.list = async function(req, res, next) {
    console.log('Request to list events...');

    const startIndex = req.query.startIndex,
        count = req.query.count,
        q = req.query.q,
        categoryIds = req.query.categoryIds,
        organizerId = req.query.organizerId,
        sortBy = req.query.sortBy;

    console.log(categoryIds);
    //if count is 0 or missing throw bad request? should it have a default value?

    try {
        // Checks all categories exist
        if (categoryIds) {
            for (const id of categoryIds) {
                const [category] = await Crud.read('category', {id: id});
                if (!category) return next(BadRequest('category does not exist'));
            }
        }

        const orders = {
            'ALPHABETICAL_ASC': 'title',
            'ALPHABETICAL_DESC': 'title desc',
            undefined: 'date',
            'DATE_ASC': 'date',
            'DATE_DESC': 'date desc',
            'ATTENDEES_ASC': 'attendees',
            'ATTENDEES_DESC': 'attendees desc',
            'CAPACITY_ASC': 'capacity',
            'CAPACITY_DESC': 'capacity desc'
        }



        const data = {
            startIndex: startIndex,
            count: count,
            q: q,
            categoryIds: categoryIds,
            organizerId: organizerId,
            sortBy: orders[sortBy]
        }
        const results = await Events.search(data);

        res.status(200)
            .send(results);
    } catch (err) {
        res.status(500)
            .send('Internal server error');
        console.log(err);
    }
}

exports.create = async function(req, res, next) {
    console.log('Request to create event...');

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
        // Gets authUser
        const authUser = await getAuthUser(req);
        // If authUser does not exist, returns unauthorized
        if (!authUser) return next(Unauthorized());

        // TODO: check for duplicate ids in categoryIds and how to respond?
        // Counts the number of categories matching the category ids
        const categoriesCount = await Events.countCategories(categoryIds);
        // If the number of categoryIds does not match the number of counted categories, return bad request
        if (categoryIds.length !== categoriesCount) return next(BadRequest('categoriesIds not valid'));

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

    } catch (err) {
        next(err);
    }
}

exports.getOne = async function(req, res, next) {
    console.log('Request to get an event...');

    const id = req.params.id;
    try {
        const [event] = await Crud.read('event', {id: id});

        if (!event) return next(NotFound());

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

    } catch (err) {
        next(err);
    }
}

exports.edit = async function(req, res, next) {
    console.log('Request to edit an event...');

    const title = req.body.title,
        description = req.body.description,
        categoryIds = req.body.categoryIds,
        date = req.body.date, //TODO: date required?
        isOnline = req.body.isOnline,
        url = req.body.url,
        venue = req.body.venue,
        capacity = req.body.capacity,
        requiresAttendanceControl = req.body.requiresAttendanceControl,
        fee = req.body.fee;

    const id = req.params.id;
    try {

        //TODO: check for event existence first or category existence?
        const [event] = await Crud.read('event', {id: id});
        if (!event) return next(NotFound());

        if (categoryIds) {
            for (const catId of categoryIds) {
                const [result] = await Crud.read('category', {id: catId});
                if (!result) return next(BadRequest('category does not exist'));
            }
        }

        const authUser = await getAuthUser(req);
        if (!authUser) return next(Unauthorized());

        console.log(authUser);
        console.log(event.organizer_id);
        if (authUser.id !== event.organizer_id) return next(Forbidden());

        const data = {};
        if (title) data.title = title;
        if (description) data.description = description;
        if (date) data.date = date;
        if (isOnline) data.is_online = isOnline;
        if (url) data.url = url;
        if (venue) data.venue = venue;
        if (capacity) data.capacity = capacity;
        if (requiresAttendanceControl) data.requires_attendance_control = requiresAttendanceControl;
        if (fee) data.fee = fee;
        await Crud.update('event', data, {id: id});
        if (categoryIds) {
            await Crud.delete('event_category', {event_id: id});
            for (const catId of categoryIds) {
                await Crud.create('event_category', {event_id: id, category_id: catId});
            }
        }
        res.status(200).send();

    } catch (err) {
        next(err);
    }
}

exports.delete = async function(authUser, req, res, next) {
    console.log('Request to delete an event...')

    const id = parseInt(req.params.id);
    try {
        const [event] = await Crud.read('event', {id: id});

        if (!event) return next(NotFound());
        if (event.organizer_id !== authUser.id) return next(Forbidden());

        await Crud.delete('event_attendees', {event_id: id});
        await Crud.delete('event_category', {event_id: id});
        await Crud.delete('event', {id: id});
        res.status(200).send();

    } catch (err) {
        next(err);
    }
}

exports.getCategories = async function(req, res, next) {
    console.log('Request to get categories...');

    try {
        const categories = await Crud.read('category');

        res.status(200)
            .send(categories);
    } catch (err) {
        next(err);
    }
}