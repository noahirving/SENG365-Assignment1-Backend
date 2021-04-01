const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.hash = async function(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
}

exports.compare = async function(plainTextPassword, hash) {
    return await bcrypt.compare(plainTextPassword, hash);
}

