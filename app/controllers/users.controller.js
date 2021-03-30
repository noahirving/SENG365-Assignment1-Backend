const Users = require("../models/users.model");
const RandToken = require('rand-token');
const Authorize = require('../middleware/authorize');
const Crud = require('../models/crud');
const {NotFound, BadRequest, Forbidden} = require("../middleware/http-errors");

exports.register = async function (req, res, next) {
    console.log('Request to register user...');

    const firstName = req.body.firstName,
        lastName = req.body.lastName,
        email = req.body.email,
        password = req.body.password;

    try {
        // If email already exists #BAD REQUEST
        if (await Users.emailExists(email)) 
            return next(BadRequest('email already exists'));
        
        const newUser = await Crud.create('user', {
            first_name:firstName,
            last_name:lastName,
            email:email,
            password:password
        });
        res.status(201)
            .send({userId: newUser.insertId});
    
    } catch (err) { // #INTERNAL SERVER ERROR
        next(err);
    }
}

exports.login = async function(req, res, next) {
    console.log('Request to login...');

    const email = req.body.email,
        password = req.body.password;

    try {
        // Gets user with matching email and password as those passed in the request
        const [user] = await Crud.read('user', {email: email, password: password});
        if (!user) return next(BadRequest('Invalid email or password'));

        // Generates a unique token
        const token = await generateUniqueToken();

        // Updates user table with the token where the user's id is found
        await Crud.update('user', {auth_token: token}, {id: user.id});

        // Responds with the user's id and token
        res.status(200)
            .send({
                userId: user.id,
                token: token
            });

    } catch (err) {
        next(err);
    }
}

async function generateUniqueToken() {
    let token;
    let tokenUsed;
    // Gets a new token until a token is not used
    do {
        token = RandToken.generate(32);
        [tokenUsed] = await Crud.read('user', {auth_token: token});
    } while (tokenUsed);

    return token;
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
        // Gets user matching id
        const [user] = await Crud.read('user', {id: id});
        // If user is not found return not found
        if (!user) return next(NotFound());

        let response = {
            firstName: user.first_name,
            lastName: user.last_name
        };

        // If the token exists and matched the user's token add the email to the response
        if (token && user.auth_token === token) response.email = user.email;

        res.status(200)
            .send(response);

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

    // If no new data is provided to update, returns a bad request
    if (!(firstName || lastName || email || password)) return next(BadRequest('you must provide some details to update'));

    const id = parseInt(req.params.id);
    try {
        // If the authorised user's id does not match the provided id, return forbidden
        if (authUser.id !== id) return next(Forbidden());

        let data = {};
        if (firstName) data.first_name = firstName;
        if (lastName) data.last_name = lastName;
        if (email) {
            // Gets user matching email
            const [userWithEmail] = await Crud.read('user', {email: email});
            // If user with email exists and is not current user, returns bad request
            if (userWithEmail && userWithEmail.id !== id) return next(BadRequest('email already in use'));

            data.email = email;
        }
        if (password) {
            // If the current password does no match the auth user's password, return bad request
            if (currentPassword !== authUser.password) return next(BadRequest('incorrect password'));

            data.password = password;
        }
        await Crud.update('user', data, {'id': id});
        res.status(200)
            .send();

    } catch(err) {
        next(err);
    }
}
