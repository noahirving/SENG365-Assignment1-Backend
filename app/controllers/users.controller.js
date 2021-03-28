const Users = require("../models/users.model");
const RandToken = require('rand-token');
const Authorize = require('../middleware/authorize');

exports.register = async function (req, res, next) {
    const firstName = req.body.firstName,
        lastName = req.body.lastName,
        email = req.body.email,
        password = req.body.password;

    try {
        // If email already exists #BAD REQUEST
        if (await Users.emailExists(email)) {
            const err = new Error('email already in use');
            err.status = 400;
            next(err);
        } else { // User registering has been validated
            const result = await Users.create({
                'first_name':firstName,
                'last_name':lastName,
                'email':email,
                'password':password
            });
            res.status(201)
                .send({userId: result.insertId});
        }
    } catch (err) { // #INTERNAL SERVER ERROR
        next(err);
    }
}

exports.login = async function(req, res, next) {
    const email = req.body.email,
        password = req.body.password;
    console.log(email + '  ' + password);
    try {
        const [result] = await Users.read({"email": email, "password": password});
        if (result) {
            const token = RandToken.generate(32);
            await Users.update({"auth_token": token}, {'id': result.id});

            res.status(200)
                .send({
                    "userId": result.id,
                    "token": token
                });
        } else {
            const err = new Error('Invalid email or password');
            err.status = 400;
            next(err);
        }

    } catch (err) {
        next(err);
    }
}

exports.logout = async function(req, res, next) {
    const token = req.get('X-Authorization');
    if (!token) {
        next(Unauthorized());
    } else {
        try {
            const [result] = await Users.read({'auth_token': token});
            if (!result) {
                next(Unauthorized());
            } else {
                await Users.update({'auth_token': null}, {'id': result.id});

                res.status(200)
                    .send();
            }
        } catch (err) {
            next(err);
        }
    }
}

exports.getUser = async function(req, res, next) {

    const id = req.params.id;

    try {
        const [result] = await Users.read({'id': id});
        if (result) {
            const response = {
                firstName: result.first_name,
                lastName: result.last_name
            };
            const token = req.get('X-Authorization');
            if (result.auth_token === token) response.email = result.email;
            res.status(200)
                .send(response);

        } else {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
        }
    } catch (err) {
        next(err);
    }
}

exports.updateUser = async function(req, res, next) {
    const firstName = req.body.firstName,
        lastName = req.body.lastName,
        email = req.body.email,
        password = req.body.password,
        currentPassword = req.body.currentPassword;

    if (!(firstName || lastName || email || password)) next(BadRequest('you must provide some details to update'));

    const id = req.params.id;
    try {
        const [result] = await Users.read({'id': id});
        const token = req.get('X-Authorization');
        if (result.auth_token === token) {
            let data = {};
            if (firstName) data.first_name = firstName;
            if (lastName) data.last_name = lastName;
            if (email) {
                const usersWithEmail = await Users.read({'email': email});
                if (usersWithEmail.length === 0) {
                    data.email = email;
                } else {
                    next(BadRequest('email already in use'));
                }
            }
            if (password) {
                if (currentPassword === result.password) {
                    data.password = password;
                } else {
                    next(BadRequest('incorrect password'));
                }
            }
            console.log(data);

            await Users.update(data, {'id': id});
            res.status(200)
                .send();
        } else {
            next(Unauthorized());
        }
    } catch(err) {
        next(err);
    }

}

function Unauthorized() {
    const err = new Error();
    err.name = 'Unauthorized';
    err.status = 401;
    return err;
}

function BadRequest(message) {
    const err = new Error(message);
    err.name = 'Bad Request';
    err.status = 400;
    return err;
}

function Forbidden() {
    const err = new Error();
    err.name = 'Forbidden';
    err.status = 403;
    return err;
}


