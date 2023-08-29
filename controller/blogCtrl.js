const Blog = require('../models/blogModel');
const User = require('../models/userModels');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const cloudinaryUploadImg = require('../utils/cloudinary');
const fs = require('fs');
const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);
    res.json({
      status: 'success',
      newBlog,
    });
  } catch (err) {
    throw new Error(err);
  }
});
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({ updateBlog });
  } catch (err) {
    throw new Error(err);
  }
});
const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBlog = await Blog.findById(id)
      .populate('likes')
      .populate('dislikes');
    const updateViews = await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 },
      },
      {
        new: true,
      }
    );
    res.json({ getBlog });
  } catch (err) {
    throw new Error(err);
  }
});
const getAllBlog = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    console.log(queryObj);
    // const getAllBlog = await Blog.find();
    let queryStr = JSON.stringify(queryObj);
    let query = Blog.find(JSON.parse(queryStr));
    const blog = await query;
    res.json({
      blog,
    });
  } catch (err) {
    throw new Error(err);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.json({ deleteBlog });
  } catch (err) {
    throw new Error(err);
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);
  //Tim blog ma ban muon like
  const blog = await Blog.findById(blogId);
  //tim nguoi like
  const loginUserId = req?.user?._id;
  console.log(loginUserId, blog);
  //Ktra xem dislike hay chua
  const isDisLiked = blog.isDisliked;
  //Ktra xem da like truoc do hay chua
  const alreadyLiked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyLiked) {
    console.log(1);
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isDisLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { dislikes: loginUserId },
        isDisliked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});
const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoDbId(blogId);
  //Tim blog ma ban da like
  const blog = await Blog.findById(blogId);
  //tim nguoi like
  const loginUserId = req?.user?._id;
  //Ktra xem da like hay chua
  const isLiked = blog?.isLiked;
  //Ktra xem da dislike truoc do hay chua
  const alreadyDisliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId?.toString()
  );
  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $push: { likes: loginUserId },
        isLiked: true,
      },
      {
        new: true,
      }
    );
    res.json(blog);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const uploader = (path) => cloudinaryUploadImg(path, 'images');
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      {
        new: true,
      }
    );
    res.json(findBlog);
  } catch {}
});
module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlog,
  deleteBlog,
  likeBlog,
  dislikeBlog,
  uploadImages,
};
