const Events = require('../models/events.model');
const Crud = require('../models/crud');
const {NotFound, BadRequest, Forbidden, Unauthorized} = require("../middleware/http-errors");
const {getAuthUser} = require('../middleware/authorize');
const {getContentType, getExtension, imagePath} = require('../controllers/helper');

exports.get = async function(req, res, next){
    console.log('Request to get attendees...');

    const id = req.params.id;
    try {
        const [event] = await Crud.read('event', {id: id});
        if (!event) return next(NotFound());



        const authUser = await getAuthUser(req);
        let attendees;
        if (authUser) {
            attendees = await Events.readAttendees(authUser.id === event.organizer_id, event.id, authUser.id);
        } else {
            attendees = await Events.readAttendees(false, event.id, undefined);
        }

        const statuses = {'1':'accepted', '2': 'pending', '3': 'rejected'};
        let response = [];
        for (const a of attendees) {
            response.push({
                attendeeId: a.id,
                status: statuses[a.attendance_status_id],
                firstName: a.first_name,
                lastName: a.last_name,
                dateOfInterest: a.date_of_interest
            })
        }

        res.status(200)
            .send(response);


    } catch (err) {
        next(err)
    }
}

exports.attend = async function(req, res, next) {
    console.log(`Request to attend an event...`);

    const id = parseInt(req.params.id);
    try {

        const [event] = await Crud.read('event', {id: id});
        if (!event) return next(NotFound());

        const authUser = await getAuthUser(req);
        if (!authUser) return next(Unauthorized());

        const [alreadyAttending] = await Crud.read('event_attendees', {event_id: id, user_id: authUser.id});
        if (alreadyAttending || event.date < new Date()) return next(Forbidden());

        await Crud.create('event_attendees', {
            event_id: id,
            user_id: authUser.id,
            date_of_interest: new Date(),
            attendance_status_id: 1
        });

        res.status(201).send();
    } catch (err) {
        next(err)
    }
}

exports.removeAttendance = async function(req, res, next) {
    console.log(`Request to remove attendance of an event...`);

    const id = parseInt(req.params.id);
    try {

        const [event] = await Crud.read('event', {id: id});
        if (!event) return next(NotFound());

        const authUser = await getAuthUser(req);
        if (!authUser) return next(Unauthorized());

        const [attendee] = await Crud.read('event_attendees', {event_id: id, user_id: authUser.id});

        if (!attendee || event.date < new Date() ||
            (attendee && attendee.attendance_status_id === 3)) return next(Forbidden());


        await Crud.update('event_attendees', {attendance_status_id: 3}, {user_id: authUser.id});
        res.status(200).send();
    } catch (err) {
        next(err)
    }
}

exports.changeStatus = async function(req, res, next) {
    console.log(`Request to change attendee status`);

    const statusNums = {accepted: 1, pending: 2, rejected: 3};
    const event_id = req.params.event_id,
        user_id = req.params.user_id,
        status = req.body.status;
    try {
        const [attendee] = await Crud.read('event_attendees', {event_id: event_id, user_id: user_id});
        if (!attendee) return next(NotFound());

        if(statusNums[status] === undefined) return next(BadRequest('status does not exist'));

        const authUser = await getAuthUser(req);
        if (!authUser) return next(Unauthorized());

        const [event] = await Crud.read('event', {id: event_id});
        if (authUser.id !== event.organizer_id) return next(Forbidden());

        await Crud.update('event_attendees', {attendance_status_id: statusNums[status]}, {id: attendee.id});

        res.status(200).send();
    } catch (err) {
        next(err);
    }
}
