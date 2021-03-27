const Validator = require("jsonschema").Validator;
const v = new Validator();


exports.User = {
    "title": "User",
    "id": "/User",
    "type": "object",
    "properties": {
        "firstName": {
            "type": "string",
            "minLength": 1,
            "example": "Adam"
        },
        "lastName": {
            "type": "string",
            "minLength": 1,
            "example": "Anderson"
        },
        "email": {
            "type": "string",
            "minLength": 1,
            "format": "email",
            "example": "aaa11@uclive.ac.nz"
        }
    }
};

exports.FullUser = {
    "title": "FullUser",
    "id": "/FullUser",
    "type": "object",
    "allOf": [
        {
            "$ref": "/User"
        }
    ],
    "properties": {
        "userId": {
            "type": "integer",
            "minimum": 0,
            "example": 11
        },
        "password": {
            "type": "string",
            "minLength": 1,
            "format": "password",
            "example": "letmein"
        },
        "userToken": {
            "type": "string",
            "example": "JSkIEpXk0b2jLgDpRuKAjGwCbFnDM0Tj"
        }
    }
};

exports.Event = {
    "title": "Event",
    "id": "/Event",
    "type": "object",
    "allOf": [
        {
            "$ref": "/EventOverview"
        }
    ],
    "properties": {
        "description": {
            "type": "string",
            "example": "Pizza party to celebrate the nice weather."
        },
        "organizerId": {
            "$ref": "/FullUser/properties/userId"
        },
        "date": {
            "allOf": [
                {
                    "$ref": "/DateTimeOutput"
                }
            ],
            "nullable": true
        },
        "isOnline": {
            "type": "boolean",
            "example": false,
            "nullable": true
        },
        "url": {
            "type": "string",
            "example": "http://example.com",
            "nullable": true
        },
        "venue": {
            "type": "string",
            "example": "Town Hall",
            "nullable": true
        },
        "requiresAttendanceControl": {
            "type": "boolean",
            "example": true,
            "nullable": true
        },
        "fee": {
            "type": "number",
            "example": 10,
            "nullable": true
        }
    }
};

exports.EventOverview = {
    "title": "EventOverview",
    "id": "/EventOverview",
    "type": "object",
    "properties": {
        "eventId": {
            "type": "integer",
            "example": 1
        },
        "title": {
            "type": "string",
            "minLength": 1,
            "example": "Pizza party"
        },
        "categories": {
            "type": "array",
            "items": {
                "$ref": "/Category/properties/categoryId"
            }
        },
        "organizerFirstName": {
            "$ref": "/User/properties/firstName"
        },
        "organizerLastName": {
            "$ref": "/User/properties/lastName"
        },
        "numAcceptedAttendees": {
            "type": "integer",
            "minimum": 0,
            "example": 37,
            "nullable": true
        },
        "capacity": {
            "type": "integer",
            "minimum": 1,
            "example": 100,
            "nullable": true
        }
    }
};

exports.Category = {
    "title": "Category",
    "id": "/Category",
    "type": "object",
    "properties": {
        "categoryId": {
            "type": "integer",
            "example": 1
        },
        "name": {
            "type": "string",
            "minLength": 1,
            "example": "Film"
        }
    }
};

exports.EventSearchRequest = {
    "title": "EventSearchRequest",
    "id": "/EventSearchRequest",
    "type": "object",
    "properties": {
        "startIndex": {
            "type": "integer",
            "minimum": 0,
            "default": 0,
            "example": 20
        },
        "count": {
            "type": "integer",
            "minimum": 0,
            "example": 10
        },
        "q": {
            "$ref": "/EventOverview/properties/title"
        },
        "categoryIds": {
            "type": "array",
            "items": {
                "$ref": "/Category/properties/categoryId"
            }
        },
        "organizerId": {
            "$ref": "/FullUser/properties/userId"
        },
        "sortBy": {
            "type": "string",
            "enum": [
                "ALPHABETICAL_ASC",
                "ALPHABETICAL_DESC",
                "ATTENDEES_ASC",
                "ATTENDEES_DESC",
                "DATE_ASC",
                "DATE_DESC",
                "CAPACITY_ASC",
                "CAPACITY_DESC"
            ],
            "default": "DATE_DESC"
        },
        "reverseSort": {
            "type": "boolean",
            "default": false
        }
    }
};

exports.Attendee = {
    "title": "Attendee",
    "id": "Attendee",
    "type": "object",
    "properties": {
        "attendeeId": {
            "$ref": "/FullUser/properties/userId"
        },
        "status": {
            "$ref": "/AttendeeStatus"
        },
        "firstName": {
            "$ref": "/User/properties/firstName"
        },
        "lastName": {
            "$ref": "/User/properties/lastName"
        },
        "dateOfInterest": {
            "$ref": "/DateTimeOutput"
        }
    }
};

exports.AttendeeStatus = {
    "title": "AttendeeStatus",
    "id": "/AttendeeStatus",
    "type": "string",
    "enum": [
        "accepted",
        "pending",
        "rejected"
    ],
    "example": "accepted"
};

exports.ChangeAttendeeStatusRequest = {
    "title": "ChangeAttendeeStatusRequest",
    "id": "/ChangeAttendeeStatusRequest",
    "type": "object",
    "properties": {
        "status": {
            "$ref": "/AttendeeStatus"
        }
    }
};

exports.DateTimeInput = {
    "title": "DateTimeInput",
    "id": "/DateTimeInput",
    "description": "A datetime expressed with no timezone, as either a date (yyyy-MM-dd) or date and time (yyyy-MM-dd hh:mm:ss.sss)",
    "type": "string",
    "example": "2012-04-23 18:25:43.511"
};

exports.DateTimeOutput = {
    "title": "DateTimeOutput",
    "id": "/DateTimeOutput",
    "description": "A UTC datetime expressed in ISO8601 format (yyyy-MM-ddThh:mm:ss.sssZ)",
    "type": "string",
    "example": "2012-04-23T18:25:43.511Z"
};

exports.BinaryImageFile = {
    "id": "/BinaryImageFile",
    "type": "string",
    "format": "binary",
    "description": "The raw content of the PNG, JPEG, or GIF image file.",
    "example": "(raw content of PNG, JPEG, or GIF image file)"
};

exports.SqlResult = {
    "id": "/SqlResult",
    "type": "object",
    "properties": {
        "fieldCount": {
            "type": "integer",
            "example": 0
        },
        "affectedRows": {
            "type": "integer",
            "example": 1
        },
        "insertId": {
            "type": "integer",
            "example": 0
        },
        "serverStatus": {
            "type": "integer",
            "example": 2
        },
        "warningCount": {
            "type": "integer",
            "example": 0
        },
        "message": {
            "type": "string",
            "example": "(Rows matched: 1  Changed: 0  Warnings: 0"
        },
        "protocol41": {
            "type": "boolean"
        },
        "changedRows": {
            "type": "integer"
        }
    }
};

exports.SqlResultSet = {
    "id": "/SqlResultSet",
    "type": "array",
    "items": {}
};

/*
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
};*/

exports.RegisterUser = {
    "title": "RegisterUserRequest",
    "properties": {
        "firstName": {
            "$ref": "/User/properties/firstName"
        },
        "lastName": {
            "$ref": "/User/properties/lastName"
        },
        "email": {
            "$ref": "/User/properties/email"
        },
        "password": {
            "$ref": "/FullUser/properties/password"
        }
    },
    "required": [
        "firstName",
        "lastName",
        "email",
        "password"
    ]
};

v.addSchema(exports.User);
v.addSchema(exports.FullUser);
v.addSchema(exports.RegisterUser);


exports.getValidator = function () {
    return v;
}