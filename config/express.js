const express = require('express');
const bodyParser = require('body-parser');
const OpenApiValidator = require("express-openapi-validator");
const path = require("path");
const { allowCrossOriginRequestsMiddleware } = require('../app/middleware/cors.middleware');

module.exports = function () {
    // INITIALISE EXPRESS //
    const app = express();
    app.rootUrl = '/api/v1';

    // MIDDLEWARE
    app.use(allowCrossOriginRequestsMiddleware);
    app.use(bodyParser.json());
    app.use(bodyParser.raw({ type: 'text/plain' }));  // for the /executeSql endpoint


    const spec = path.join(__dirname, '../app/resources/seng365_event_site_api_spec.yaml');
    app.use('/spec', express.static(spec));
    app.use(
        OpenApiValidator.middleware({
            apiSpec: spec,
            validateRequests: true, // (default)
            //validateResponses: true, // false by default
            $refParser: {
                mode: 'dereference'
            },

        }),
    );



    // DEBUG (you can remove these)
    app.use((req, res, next) => {
        console.log(`##### ${req.method} ${req.path} #####`);
        next();
    });

    app.get('/', function (req, res) {
        res.send({ 'message': 'Hello World!' })
    });

    // ROUTES
    require('../app/routes/backdoor.routes')(app);
    require('../app/routes/events.routes')(app);
    require('../app/routes/users.routes')(app);

    app.use((err, req, res, next) => {
        // format errors
        console.log(err);
        res.statusMessage = err;
        res.status(err.status || 500).end();
    });

    return app;
};
