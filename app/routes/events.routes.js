const events = require('../controllers/events.controller');

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
}