const fs = require('mz/fs');
exports.imagePath = 'storage/images/';

exports.getContentType = function(imageName) {
    if (imageName.endsWith('.png')) return 'image/png';
    if (imageName.endsWith('.jpg')) return 'image/jpeg'
    return 'image/gif';
}

exports.getExtension = function(contentType) {
    if (contentType === 'image/png') return '.png';
    if (contentType === 'image/jpeg') return '.jpg';
    if (contentType === 'image/gif') return '.gif';
    return undefined;
}

exports.fileExists = async function (filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        return false;
    }
}