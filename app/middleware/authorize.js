const RandToken = require("rand-token");
const Users = require("../models/users.model");

exports.isAuthorized = async function(req, res, next) {
    console.log(`Checking authorisation...`);

    const authToken = req.get('X-Authorization');
    try {
        if (authToken) {
            const [authUser] = await Users.read({'auth_token': authToken});
            if (authUser) next(authUser);
            else res.status(401).send();

        } else {
            res.status(401).send();
        }
    } catch(err) {
        console.log(err);
        res.status(500).send();
    }

}

function Unauthorized() {
    const err = new Error();
    err.name = 'Unauthorized';
    err.status = 401;
    return err;
}
