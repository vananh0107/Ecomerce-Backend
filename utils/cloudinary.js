const cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.SECRET_KEY,
});
const cloudinaryUploadImg = async (file) => {
  const result = await cloudinary.uploader.upload(file);
  return result;
};
const cloudinaryDeleteImg = async (id) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(id, (result) => {
      resolve(
        {
          url: result.secure_url,
        },
        {
          resource_type: 'auto',
        }
      );
    });
  });
};

module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };
