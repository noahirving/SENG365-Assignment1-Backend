const RandToken = require("rand-token");
const Users = require("../models/users.model");
const Crud = require("../models/crud");

/*
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

}*/

exports.getAuthUser = async function(req) {
    const token = req.get('X-Authorization') || req.get('x-authorization');
    if (!token) return;

    const [authUser] = await Crud.read('user', {auth_token: token});
    return authUser;
}



