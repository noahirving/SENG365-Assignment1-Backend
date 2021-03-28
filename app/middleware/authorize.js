const RandToken = require("rand-token");
const Users = require("../models/users.model");

exports.isAuthorized = async function(req, res, next) {
    const authToken = req.get('X-Authorization');

    console.log(authToken);
    const result = await Users.read({'auth_token': authToken});
    /*
    if (result > 0) {
        next(result[0]);
    } else {
        res.status(); // FINISH
    }*/

}