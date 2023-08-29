const PCategory = require('../models/prodCatModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const createPCategory = asyncHandler(async (req, res) => {
  try {
    const newPCategory = await PCategory.create(req.body);
    res.json(newPCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const getPCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getPCategory = await PCategory.findById(id);
    res.json(getPCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const getAllPCategory = asyncHandler(async (req, res) => {
  try {
    const getAllPCategory = await PCategory.aggregate([
      { $sort: { title: 1, _id: 1 } },
    ]);
    res.json(getAllPCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const updatePCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatePCategory = await PCategory.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatePCategory);
  } catch (err) {
    throw new Error(err);
  }
});
const deletePCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletePCategory = await PCategory.findByIdAndDelete(id, req.body, {
      new: true,
    });
    res.json(deletePCategory);
  } catch (err) {
    throw new Error(err);
  }
});

module.exports = {
  createPCategory,
  updatePCategory,
  deletePCategory,
  getPCategory,
  getAllPCategory,
};
