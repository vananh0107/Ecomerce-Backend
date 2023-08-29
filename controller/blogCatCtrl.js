const BCategory = require('../models/blogCatModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const createBCategory = asyncHandler(async (req, res) => {
  try {
    const newBCategory = await BCategory.create(req.body);
    res.json(newBCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const getBCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getBCategory = await BCategory.findById(id);
    res.json(getBCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const getAllBCategory = asyncHandler(async (req, res) => {
  try {
    const getAllBCategory = await BCategory.find();
    res.json(getAllBCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const updateBCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBCategory = await BCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updateBCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const deleteBCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteBCategory = await BCategory.findByIdAndDelete(id, req.body, {
      new: true,
    });
    res.json(deleteBCategory);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createBCategory,
  updateBCategory,
  deleteBCategory,
  getBCategory,
  getAllBCategory,
};
