const Crud = require("../models/crud");

exports.getAuthUser = async function(req) {
    const token = req.get('X-Authorization') || req.get('x-authorization');
    if (!token) return;

    const [authUser] = await Crud.read('user', {auth_token: token});
    return authUser;
}



