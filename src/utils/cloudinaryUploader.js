const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (
    filePath,
    options = { transformation: [{ width: 250, crop: 'scale' }, { quality: 'auto' }, { fetch_format: 'auto' }] },
) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, { ...options, folder: 'me-vivu' }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
