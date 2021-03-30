const users = require('../controllers/users.controller');
const usersImages = require('../controllers/users.images.controller');
const isAuthorized = require('../middleware/authorize').isAuthorized;

module.exports = function (app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.register);

    app.route(app.rootUrl + '/users/login')
        .post(users.login);

    app.route(app.rootUrl +'/users/logout')
        .post(users.logout);

    app.route(app.rootUrl + '/users/:id')
        .get(users.getUser)
        .patch(users.updateUser);

    app.route(app.rootUrl + '/users/:id/image')
        .get(usersImages.get)
        .put(usersImages.set)
        .delete(usersImages.delete);
}