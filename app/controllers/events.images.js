const Events = require('../models/events.model');
const Crud = require('../models/crud');
const fs = require('mz/fs');
const {getAuthUser} = require("../middleware/authorize");
const {NotFound, BadRequest, Forbidden, Unauthorized} = require("../middleware/http-errors");
const {getContentType, getExtension, fileExists, imagePath} = require('../controllers/helper');

exports.get = async function(req, res, next) {
    console.log('Request to get event image...');

    const id = req.params.id;
    try {
        const [event] = await Crud.read('event', {id: id});
        // If the user or the user's image was not found
        if (!event || !event.image_filename) return next(NotFound());

        const image = await fs.readFile(imagePath + event.image_filename);

        res.set('Content-Type', getContentType(event.image_filename));

        res.status(200)
            .send(image);

    } catch (err) {
        next(err);
    }
}

exports.set = async function(req, res, next) {
    console.log(`Request to set a event's image...`);

    const id = parseInt(req.params.id);
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return next(Unauthorized());

        const [event] = await Crud.read('event', {id: id});
        if (!event) return next(NotFound());
        if (authUser.id !== event.organizer_id) return next(Forbidden());

        const contentType = req.get('Content-Type');
        const extension = getExtension(contentType);
        if (!extension) return next(BadRequest('not an accepted image type'));

        const imageName = 'event_' + event.id + extension;

        // Deletes the user's current image if it exists
        if (event.image_filename && await fileExists(imagePath + event.image_filename))
            await fs.unlink(imagePath + event.image_filename);

        //const status = event.image_filename ? 200 : 201;
        await Crud.update('event', {image_filename: null}, {id: id});

        await fs.writeFile(imagePath + imageName, req.body);
        await Crud.update('event', {image_filename: imageName}, {id: id});

        res.status(200)
            .send();

    } catch (err) {
        next(err);
    }
}


