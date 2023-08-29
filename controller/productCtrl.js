const Product = require('../models/productModel');
const PCategory = require('../models/prodCatModel');
const Color = require('../models/colorModel');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');
const User = require('../models/userModels');
const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (err) {
    throw new Error(err);
  }
});
const createColor = asyncHandler(async (req, res) => {
  try {
    const newColor = await Color.create(req.body);
    res.json(newColor);
  } catch (err) {
    throw new Error(err);
  }
});
const getColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const color = await Color.findById(id);
    res.json(color);
  } catch (err) {
    throw new Error(err);
  }
});
const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const updateColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateColor);
  } catch (err) {
    throw new Error(err);
  }
});
const getAllColor = asyncHandler(async (req, res) => {
  try {
    const newColor = await Color.find();
    res.json(newColor);
  } catch (err) {
    throw new Error(err);
  }
});
const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const deleteColor = await Color.findByIdAndDelete(id);
    res.json(deleteColor);
  } catch (err) {
    throw new Error(err);
  }
});
const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById(id);
    res.json(findProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteProduct = await Product.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateProduct);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    //Filtering
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((field) => delete queryObj[field]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Product.find(JSON.parse(queryStr));
    //Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    //limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //pagination
    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error('This page is not exsist');
    }
    const product = await query;
    res.json(product);
  } catch (err) {
    throw new Error(err);
  }
});
const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishList.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishList: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishList: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (err) {
    throw new Error(err);
  }
});
const addToCompare = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.compare.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { compareList: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { compareList: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (err) {
    throw new Error(err);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.rating.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    let user = await User.findById(_id);
    let userName = user.firstname + ' ' + user.lastname;
    console.log(userName);

    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          rating: { $elemMatch: alreadyRated }, //truy van
        },
        {
          $set: {
            'rating.$.star': star,
            'rating.$.comment': comment,
            'rating.$.name': userName,
            'rating.$.date': new Date(),
          },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            rating: {
              star: star,
              comment: comment,
              name: userName,
              date: new Date(),
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getAllRating = await Product.findById(prodId);
    let totalRating = getAllRating.rating.length;
    let ratingsum = getAllRating.rating
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      {
        new: true,
      }
    );
    res.json(finalproduct);
  } catch (err) {
    throw new Error(err);
  }
});
const getQuantityProductCat = asyncHandler(async (req, res) => {
  try {
    const count = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { title: 1, _id: 1 } },
    ]);
    res.json(count);
  } catch (err) {
    throw new Error(err);
  }
});
module.exports = {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  addToCompare,
  createColor,
  getAllColor,
  deleteColor,
  getColor,
  updateColor,
  getQuantityProductCat,
};
