const Users = require("../models/users.model");
const RandToken = require('rand-token');

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
            const result = await Users.create(firstName, lastName, email, password);
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
    try {
        const result = await Users.read({"email": email, "password": password});
        if (result.length > 0) {
            const token = RandToken.generate(32);


            res.status(200)
                .send({
                    "userId": result[0].id,
                    "token": token
                });
        } else {
            const err = new Error('Invalid email or password')
            err.status = 400;
            next(err);
        }

    } catch (err) {
        next(err);
    }
}
