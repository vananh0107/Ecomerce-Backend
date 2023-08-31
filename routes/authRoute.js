const express = require('express');
const router = express.Router();
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handlerRefreshToken,
  logoutUser,
  updatePassword,
  forgotPassword,
  resetPassword,
  loginAdmin,
  getWishList,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  removeProductFromCart,
  updateQuantityProductFromCart,
  getAllOrder,
  deleteOrder,
  getOrder,
  getMonthIncome,
  getYearOrderCount,
} = require('../controller/userCtrl');
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');
router.delete(
  '/update-product-cart/:cartItemId/:newQuantity',
  authMiddleware,
  updateQuantityProductFromCart
);
router.post('/register', createUser);
router.post('/login', loginUserCtrl);
router.post('/admin-login', loginAdmin);
router.post('/cart/applycounpon', authMiddleware, applyCoupon);
router.post('/cart/cash-order', authMiddleware, createOrder);
router.get('/all-users', authMiddleware, isAdmin, getallUser);
router.delete('/order/:id', authMiddleware, isAdmin, deleteOrder);
router.get('/all-orders', authMiddleware, isAdmin, getAllOrder);
router.get('/month-order', authMiddleware, isAdmin, getMonthIncome);
router.get('/year-order', authMiddleware, isAdmin, getYearOrderCount);
router.get('/wishList', authMiddleware, getWishList);
router.get('/refresh', handlerRefreshToken);
router.get('/cart', authMiddleware, getUserCart);
router.get('/order/:id', authMiddleware, getOrder);
router.get('/get-orders', authMiddleware, getOrders);
router.get('/logout', logoutUser);
router.get('/:id', authMiddleware, isAdmin, getUser);
router.put('/order/update/:id', authMiddleware, isAdmin, updateOrderStatus);
router.put('/password', authMiddleware, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);
router.delete('/empty-cart', authMiddleware, emptyCart);

router.delete(
  '/delete-product-cart/:id',
  authMiddleware,
  removeProductFromCart
);
router.delete('/:id', deleteUser);

router.put('/edit-user', authMiddleware, updateUser);
router.post('/save-address', authMiddleware, saveAddress);
router.post('/cart', authMiddleware, userCart);
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser);
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser);
module.exports = router;
