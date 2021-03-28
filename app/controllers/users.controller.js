const Users = require("../models/users.model");


exports.register = async function (req, res) {
    const firstName = req.body.firstName,
        lastName = req.body.lastName,
        email = req.body.email,
        password = req.body.password;

    try {
        // If email already exists #BAD REQUEST
        if (await Users.emailExists(email)) {
            badRequest('email already in use', res);
        } else { // User registering has been validated
            const result = await Users.create(firstName, lastName, email, password);
            res.status(201)
                .send({userId: result.insertId});
        }
    } catch (err) { // #INTERNAL SERVER ERROR
        res.status(500)
            .send(err);
    }
}

exports.login = async function(req, res) {
    const email = req.body.email,
        password = req.body.password;
    try {
        const result = await Users.read({"email": email, "password": password});

        res.status(200)
            .send(result);
    } catch (err) {
        console.log(err);
        res.status(500)
            .send(err);
    }

}


function badRequest(message, res) {
    res.statusMessage = `Bad Request: ${message}`;
    res.status(400)
        .send();
}
