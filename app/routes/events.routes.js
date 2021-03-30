const events = require('../controllers/events.controller');
const eventsImages = require('../controllers/events.images');

module.exports = function (app) {
    app.route(app.rootUrl + '/events')
        .get(events.list)
        .post(events.create);

    app.route(app.rootUrl + '/events/categories')
        .get(events.getCategories);

    app.route(app.rootUrl + '/events/:id')
        .get(events.getOne)
        .patch(events.update)
        .delete(events.delete);

    app.route(app.rootUrl + '/events/:id/image')
        .get(eventsImages.get)
        .put(eventsImages.set);

    app.route(app.rootUrl + '/events/:event_id/attendees/user_id')
        .patch();

    app.route(app.rootUrl + '/events/:id/attendees')
        .get()
        .post()
        .delete();
}