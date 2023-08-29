const express = require('express');
const {
  createPCategory,
  updatePCategory,
  deletePCategory,
  getPCategory,
  getAllPCategory,
} = require('../controller/prodCatCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const { getQuantityProductCat } = require('../controller/productCtrl');
const router = express.Router();
router.post('/', authMiddleware, isAdmin, createPCategory);
router.put('/:id', authMiddleware, isAdmin, updatePCategory);
router.delete('/:id', authMiddleware, isAdmin, deletePCategory);
router.get('/count', getQuantityProductCat);
router.get('/:id', getPCategory);
router.get('/', getAllPCategory);
module.exports = router;
