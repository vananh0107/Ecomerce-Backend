const fs = require('fs');
const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require('../utils/cloudinary');
const asyncHandler = require('express-async-handler');
const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const uploader = (path) => cloudinaryUploadImg(path);
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push({ url: newpath.url, puclicId: newpath.public_id });
      fs.unlinkSync(path);
    }
    res.json(urls);
  } catch (error) {
    throw new Error(error);
  }
});
const deleteImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { data } = req.body;

  try {
    let images = [];
    const deleted = await cloudinaryDeleteImg(id, 'images');
    data.forEach((element) => {
      if (element.puclicId !== id) {
        images.push(element);
      }
    });
    console.log(images);
    res.json(images);
  } catch (error) {
    throw new Error(error);
  }
});
module.exports = {
  uploadImages,
  deleteImages,
};
