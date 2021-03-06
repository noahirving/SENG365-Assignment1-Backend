exports.BadRequest = function(message) {
    const err = new Error();
    if (message) err.message = message;
    err.name = 'Bad Request';
    err.status = 400;
    return err;
}

exports.Forbidden = function() {
    const err = new Error();
    err.name = 'Forbidden';
    err.status = 403;
    return err;
}

exports.NotFound = function() {
    const err = new Error();
    err.name = 'Not Found';
    err.status = 404;
    return err;
}

exports.Unauthorized = function() {
    const err = new Error();
    err.name = 'Unauthorized';
    err.status = 401;
    return err;
}