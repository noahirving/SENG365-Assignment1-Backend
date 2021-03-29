const Users = require("../models/users.model");
const RandToken = require('rand-token');
const Authorize = require('../middleware/authorize');

exports.register = async function (req, res, next) {
    console.log('Request to register user...');

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
    console.log('Request to login...');

    const email = req.body.email,
        password = req.body.password;

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

exports.logout = async function(authUser, req, res, next) {
    console.log('Request to logout...');

    try {
        await Users.update({'auth_token': null}, {'id': authUser.id});

        res.status(200)
            .send();
    } catch (err) {
        next(err);
    }
}

exports.getUser = async function(req, res, next) {
    console.log('Request to get user...');

    const id = req.params.id,
        token = req.get('X-Authorization');

    try {
        const [result] = await Users.read({'id': id});
        if (!result) {
            next(NotFound());
        } else {
            let response = {
                firstName: result.first_name,
                lastName: result.last_name
            };

            if (token && result.auth_token === token) response.email = result.email;

            res.status(200)
                .send(response);
        }
    } catch (err) {
        next(err);
    }
}

exports.updateUser = async function(authUser, req, res, next) {
    console.log(`Request to update user...`);

    const firstName = req.body.firstName,
        lastName = req.body.lastName,
        email = req.body.email,
        password = req.body.password,
        currentPassword = req.body.currentPassword;

    if (!(firstName || lastName || email || password)) next(BadRequest('you must provide some details to update'));

    const id = req.params.id;
    try {

        if (authUser.id !== id) {
            next(Forbidden());
        } else {
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
            await Users.update(data, {'id': id});
            res.status(200)
                .send();
        }
    } catch(err) {
        next(err);
    }
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

function NotFound() {
    const err = new Error();
    err.name = 'Not Found';
    err.status = 404;
    return err;
}


