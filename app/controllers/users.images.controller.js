const Crud = require('../models/crud');
const fs = require('mz/fs');
const {NotFound, BadRequest, Forbidden, Unauthorized} = require("../middleware/http-errors");
const {getAuthUser} = require('../middleware/authorize');
const {getContentType, getExtension, fileExists, imagePath} = require('../controllers/helper');

exports.get = async function(req, res, next){
    console.log('Request to get user image...');

    const id = req.params.id;
    try {
        const [user] = await Crud.read('user', {id: id});
        // If the user or the user's image was not found
        if (!user || !user.image_filename ||
            !await fileExists(imagePath + user.image_filename)) return next(NotFound());

        const image = await fs.readFile(imagePath + user.image_filename);

        res.set('Content-Type', getContentType(user.image_filename));

        res.status(200)
            .send(image);

    } catch (err) {
        next(err);
    }
}

exports.set = async function(req, res, next) {
    console.log(`Request to set a user's image...`);

    const id = parseInt(req.params.id);
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return next(Unauthorized());

        const [user] = await Crud.read('user', {id: id});
        if (!user) return next(NotFound());
        if (authUser.id !== id) return next(Forbidden());

        const contentType = req.get('Content-Type') || req.get('content-type');
        const extension = getExtension(contentType);
        if (!extension) return next(BadRequest('not an accepted image type'));

        const imageName = 'user_' + user.id + extension;

        // Deletes the user's current image if it exists
        const status = user.image_filename ? 200 : 201;
        if (user.image_filename && await fileExists(imagePath + user.image_filename))
            await fs.unlink(imagePath + user.image_filename);
        await Crud.update('user', {image_filename: null}, {id: id});

        await fs.writeFile(imagePath + imageName, req.body);
        await Crud.update('user', {image_filename: imageName}, {id: id});

        res.status(status)
            .send();

    } catch (err) {
        next(err);
    }
}

exports.delete = async function (req, res, next) {
    console.log(`Request to delete a user's image...`);

    const id = parseInt(req.params.id);
    try {
        const authUser = await getAuthUser(req);
        if (!authUser) return next(Unauthorized());

        const [user] = await Crud.read('user', {id: id});
        if (!user || !user.image_filename) return next(NotFound());
        if (authUser.id !== id) return next(Forbidden());

        if (await fileExists(imagePath + user.image_filename)) await fs.unlink();

        await Crud.update('user', {image_filename: null}, {id: id});

        res.status(200).send();
    } catch (err) {
        next(err);
    }
}