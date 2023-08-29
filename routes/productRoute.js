const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  createColor,
  getAllColor,
  getColor,
  deleteColor,
  updateColor,
} = require('../controller/productCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
router.post('/', authMiddleware, isAdmin, createProduct);
router.post('/color', authMiddleware, isAdmin, createColor);
router.get('/color', getAllColor);
router.put('/wishList', authMiddleware, addToWishList);
router.put('/rating', authMiddleware, rating);
router.get('/', getAllProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.put('/color/:id', authMiddleware, isAdmin, updateColor);
router.get('/:id', getProduct);
router.get('/color/:id', getColor);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.delete('/color/:id', authMiddleware, isAdmin, deleteColor);
module.exports = router;
