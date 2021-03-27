exports.RegisterUser = {
    'id': '/RegisterUser',
    'title': 'RegisterUser',
    'type': 'object',
    'properties': {
        'firstName': {'type': 'string', 'minLength': 1},
        'lastName': {'type': 'string', 'minLength': 1},
        'email': {'type': 'string', 'minLength': 1, 'format': 'email'},
        'password': {'type': 'string', 'minLength': 1}
    },
    'required': ['firstName', 'lastName', 'email', 'password']
};