const Users = require("../models/users.model");


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

        res.status(200)
            .send(result);
    } catch (err) {
        next(err);
    }
}
