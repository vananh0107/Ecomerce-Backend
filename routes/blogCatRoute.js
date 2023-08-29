const express = require('express');
const {
  createBCategory,
  updateBCategory,
  deleteBCategory,
  getBCategory,
  getAllBCategory,
} = require('../controller/blogCatCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();
router.post('/', authMiddleware, isAdmin, createBCategory);
router.put('/:id', authMiddleware, isAdmin, updateBCategory);
router.delete('/:id', authMiddleware, isAdmin, deleteBCategory);
router.get('/:id', getBCategory);
router.get('/', getAllBCategory);
module.exports = router;
