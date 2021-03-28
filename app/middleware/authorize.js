const RandToken = require("rand-token");
const Users = require("../models/users.model");

exports.getToken = async function(req, res, next) {



}


exports.isAuthorized = async function(req, res, next) {
    const authToken = req.get('X-Authorization');

    const result = await Users.read({'auth_token': authToken});

    if (result > 0) {
        next(result[0]);
    } else {
        res.status(); // FINISH
    }

}