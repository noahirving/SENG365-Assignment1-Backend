const users = require('../controllers/users.controller');
const isAuthorized = require('../middleware/authorize').isAuthorized;

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl +'/users/logout')
        .post(isAuthorized, users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(users.getUser)
        .patch(isAuthorized, users.updateUser);
}