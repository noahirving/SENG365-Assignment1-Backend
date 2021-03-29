const events = require('../controllers/events.controller');
const isAuthorized = require('../middleware/authorize').isAuthorized;

module.exports = function (app) {
    app.route(app.rootUrl + '/events')
        .get(events.list)
        .post(isAuthorized, events.create);

    app.route(app.rootUrl + '/events/categories')
        .get(events.getCategories);

    app.route(app.rootUrl + '/events/:id')
        .get(events.getOne)
        .patch(events.update)
        .delete(isAuthorized, events.delete);


}