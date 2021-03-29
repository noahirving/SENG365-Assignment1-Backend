const RandToken = require("rand-token");
const Users = require("../models/users.model");

exports.isAuthorized = async function(req, res, next) {
    console.log(`Checking authorisation...`);

    const authToken = req.get('X-Authorization');
    if (authToken) {

        const [result] = await Users.read({'auth_token': authToken});

        if (result) next(result);
        else res.status(401).send();

    } else {
        res.status(401).send();
    }
}

function Unauthorized() {
    const err = new Error();
    err.name = 'Unauthorized';
    err.status = 401;
    return err;
}
