const Crud = require('../models/crud');
const fs = require('mz/fs');
const {NotFound, BadRequest, Forbidden, Unauthorized} = require("../middleware/http-errors");
const {getAuthUser} = require('../middleware/authorize');

const imagePath = 'storage/images/';

exports.get = async function(req, res, next){
    console.log('Request to get user image...');

    const id = req.params.id;
    try {
        const [user] = await Crud.read('user', {id: id});
        // If the user or the user's image was not found
        if (!user || !user.image_filename) return next(NotFound());

        const image = await fs.readFile(imagePath + user.image_filename);

        if (user.image_filename.endsWith('.png')) {
            res.set('Content-Type', 'image/png')
        } else if (user.image_filename.endsWith('.jpg')) {
            res.set('Content-Type', 'image/jpeg')
        } else {
            res.set('Content-Type', 'image/gif')
        }

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

        const contentType = req.get('Content-Type');

        let imageName = 'user_' + user.id;
        if (contentType === 'image/png') {
            imageName += '.png';
        } else if (contentType === 'image/jpg') {
            imageName += '.jpg';
        } else if (contentType === 'image/gif') {
            imageName += '.gif';
        } else {
            return next(BadRequest('not an accepted image type'));
        }

        // Deletes the user's current image
        if (await fs.access(imagePath + user.image_filename))
            await fs.unlink(imagePath + user.image_filename);

        const status = user.image_filename ? 200 : 201;
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

        if (await fs.access(imagePath + user.image_filename))
            await fs.unlink(imagePath + user.image_filename)

        await Crud.update('user', {image_filename: null}, {id: id});

        res.status(200).send();
    } catch (err) {
        next(err);
    }
}