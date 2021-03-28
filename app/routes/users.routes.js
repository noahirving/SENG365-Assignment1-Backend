const users = require('../controllers/users.controller');
const authorize = require('../middleware/authorize');
module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl + '/users/:id')
        .get(authorize.isAuthorized);
}