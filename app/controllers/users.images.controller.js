const Crud = require('../models/crud');
const fs = require('mz/fs');
const {NotFound, BadRequest, Forbidden} = require("../middleware/http-errors");


exports.get = async function(req, res, next){
    console.log('Request to get user image...');

    const id = req.params.id;
    try {
        const [user] = await Crud.read('user', {id: id});
        if (!user || !user.image_filename) next(NotFound());
        else {
            const image = await fs.readFile('storage/images/' + user.image_filename);

            if (user.image_filename.endsWith('.png')) {
                res.set('Content-Type', 'image/png')
            } else if (user.image_filename.endsWith('.jpg')) {
                res.set('Content-Type', 'image/jpeg')
            } else {
                res.set('Content-Type', 'image/gif')
            }

            res.status(200)
                .send(image);
        }
    } catch (err) {
        next(err);
    }
}