const Users = require("../models/users.model");
const schema = require("../controllers/schemas");
const Validator = require("jsonschema").Validator;
const v = new Validator();

exports.register = async function (req, res) {
    const errors = v.validate(req.body, schema.RegisterUser).errors;
    // If there's at least one error in req.body #BAD REQUEST
    if (errors.length > 0) {
        badRequest(errors[0].stack, res);
    } else {
        try {
            const firstName = req.body.firstName,
                lastName = req.body.lastName,
                email = req.body.email,
                password = req.body.password;

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
}


function badRequest(message, res) {
    res.statusMessage = `Bad Request: ${message}`;
    res.status(400)
        .send();
}
