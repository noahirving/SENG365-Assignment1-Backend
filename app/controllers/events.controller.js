const Events = require('../models/events.model');

exports.list = async function(req, res) {
    const startIndex = req.query.startIndex || 0;
    const count = req.query.count;
    const q = req.query.q;
    const categoryIds = req.query.categoryids;
    const organizerId = req.query.organizerId;
    const sortBy = req.query.sortby;

    try {

    } catch (err) {

    }
}

exports.create = async function(req, res) {

}

exports.read = async function(req, res) {
    console.log('Request to read event...');

    const id = req.param.id;

    try {
        const result = Events.selectOne(id);
        if (result.length === 0) {
            res.status(404)
                .send('Not Found');
        } else {
            res.status(200)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send('Internal Server Error');
        console.log(`ERROR reading event ${id}: ${err}`);
    }
}

exports.update = async function(req, res) {

}

exports.delete = async function(req, res) {

}

exports.listCategories = async function(req, res) {

}
