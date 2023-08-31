const User = require('../models/userModels');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Counpon = require('../models/couponModel');
const Order = require('../models/orderModel');
const uniqid = require('uniqid');
const asyncHandler = require('express-async-handler');
const generateToken = require('../config/jwtToken');
const validateMongoDbId = require('../utils/validateMongodbId');
const generateRefreshToken = require('../config/refreshToken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const findUser = await User.findOne({ email: email });
  if (!findUser) {
    //cretae new user
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error('User are already exists');
  }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 604800,
    });
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error('Invalid User');
  }
});
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== 'admin') throw new Error('Not Authorised');
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateUser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 604800,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error('Invalid User');
  }
});

//log out
const logoutUser = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No refresh token');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); //forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: '',
  });
  res.clearCookies('refreshToken', {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); //forbidden
});

//handle refresh token

const handlerRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error('No refresh token');
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error('No refresh token present in db');
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error('Invalid refresh token');
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

//get all user
const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find();
    res.json(getUsers);
  } catch (err) {
    throw new Error(err);
  }
});

//get single user

const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.json({ getUser });
  } catch (err) {
    throw new Error(err);
  }
});

//delete single user

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.json({ deleteUser });
  } catch (err) {
    throw new Error(err);
  }
});
//delete cart
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOrder = await Order.findByIdAndDelete(id);
    res.json({ deleteOrder });
  } catch (err) {
    throw new Error(err);
  }
});

//update user

const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req.body?.firstname,
        lastname: req.body?.lastname,
        email: req.body?.email,
        mobile: req.body?.mobile,
      },
      {
        new: true,
      }
    );
    res.json({ updateUser });
  } catch (err) {
    throw new Error(err);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json(block);
  } catch (err) {
    throw new Error(err);
  }
});
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json(unblock);
  } catch (err) {
    throw new Error(err);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword);
  } else {
    res.json(user);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found with this email');
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi please follow this link to reset your password, This link: <a href='http://localhost:3000/reset-password/${token}'>Click here</a>`;
    const data = {
      to: email,
      text: 'Hey User',
      subject: 'Forgot Password Link',
      html: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (err) {
    throw new Error(err);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error('Token expired, PLease tru again later');
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

const getWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate('wishList');
    res.json(findUser);
  } catch (err) {
    throw new Error(err);
  }
});

//Save user address
const saveAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const updateUser = await User.findByIdAndUpdate(
      _id,
      {
        address: req?.body?.address,
      },
      {
        new: true,
      }
    );
    res.json(updateUser);
  } catch (err) {
    throw new Error(err);
  }
});
// Them san pham vao gio hang
const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    const alreadyExsistCart = await Cart.findOne({ orderby: user._id });
    let newCart;
    let cartTotal = 0;
    if (alreadyExsistCart) {
      alreadyExsistCart.products.forEach((product) => {
        cartTotal += product.price * product.count;
        products.push(product);
      });
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      let sameProduct = -1;
      products.forEach((product, index) => {
        if (
          product.product.toString() === cart[i]._id &&
          product.color == cart[i].color
        ) {
          sameProduct = index;
        }
      });
      cartTotal += cart[i].price * cart[i].count;
      if (sameProduct >= 0) {
        products[sameProduct].count += Number(cart[i].count);
      } else {
        object.product = cart[i]._id;
        object.count = cart[i].count;
        object.color = cart[i].color;
        object.title = cart[i].title;
        object.description = cart[i].description;
        let getPrice = await Product.findById(cart[i]._id);
        object.price = getPrice.price;
        products.push(object);
      }
      if (alreadyExsistCart) {
        newCart = await Cart.findByIdAndUpdate(
          alreadyExsistCart._id,
          {
            products,
            cartTotal,
            orderby: user?._id,
          },
          { new: true }
        );
      } else {
        newCart = await new Cart({
          products,
          cartTotal,
          orderby: user?._id,
        }).save();
      }
    }
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.find({ orderby: _id }).populate('products.product');
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});
const removeProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { id } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      orderby: _id,
      products: { $elemMatch: { product: id } },
    });
    let i = -1;
    let cartTotal = 0;
    let listProduct = cartItem.products;
    listProduct.forEach((item, index) => {
      const productId = item.product.toString();
      if (id == productId) {
        i = index;
      } else {
        cartTotal += item.price * item.count;
      }
    });
    listProduct.splice(i, 1);
    const deleteProductCart = await Cart.findByIdAndUpdate(
      cartItem._id,
      {
        products: listProduct,
        cartTotal,
        orderby: _id,
      },
      { new: true }
    );
    res.json(deleteProductCart);
  } catch (err) {
    throw new Error(err);
  }
});
const updateQuantityProductFromCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { cartItemId, newQuantity } = req.params;
  validateMongoDbId(_id);
  try {
    const cartItem = await Cart.findOne({
      orderby: _id,
      products: { $elemMatch: { product: cartItemId } },
    });
    let cartTotal = 0;
    let listProduct = cartItem.products;
    listProduct.forEach((item, index) => {
      const productId = item.product.toString();
      if (cartItemId == productId) {
        item.count = newQuantity;
      }
      cartTotal += item.price * item.count;
    });
    const newCart = await Cart.findByIdAndUpdate(
      cartItem._id,
      {
        products: listProduct,
        cartTotal,
        orderby: _id,
      },
      { new: true }
    );
    res.json(newCart);
  } catch (err) {
    throw new Error(err);
  }
});
const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (err) {
    throw new Error(err);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  const validCoupon = await Counpon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error('Invalid Coupon');
  }
  const user = await User.findOne({ _id });
  let { products, cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate('products.product');
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    {
      totalAfterDiscount,
    },
    {
      new: true,
    }
  );
  res.json(totalAfterDiscount);
});
const createOrder = asyncHandler(async (req, res) => {
  const { shippingInfor, orderItems, totalPrice, totalPriceAfterDiscount } =
    req.body;
  const { _id } = req.user;
  try {
    const cart = await Cart.findOneAndRemove({ orderby: _id });
    const order = await Order.create({
      shippingInfor,
      orderItems,
      totalPrice,
      totalPriceAfterDiscount,
      user: _id,
    });
    res.json({
      order,
      success: true,
    });
  } catch (error) {
    throw new Error(error);
  }
});
const getOrders = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const userorders = await Order.find({ user: _id })
      .populate('orderItems.product')
      .exec();
    res.json(userorders);
  } catch (err) {
    throw new Error(err);
  }
});
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const order = await Order.findById(id)
      .populate('orderItems.product')
      .exec();
    res.json(order);
  } catch (err) {
    throw new Error(err);
  }
});
const getAllOrder = asyncHandler(async (req, res) => {
  try {
    const listOrder = await Order.find()
      .populate('orderItems.product')
      .populate('user')
      .exec();
    res.json(listOrder);
  } catch (err) {
    throw new Error(err);
  }
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateOrderStatus = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
      },
      {
        new: true,
      }
    );
    res.json(updateOrderStatus);
  } catch (err) {
    throw new Error(err);
  }
});
const getMonthIncome = asyncHandler(async (req, res) => {
  const arrayMonth = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  let d = new Date();
  let endDate = '';
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = arrayMonth[d.getMonth()] + ' ' + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        paidAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          month: '$month',
        },
        amount: { $sum: '$totalPriceAfterDiscount' },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(data);
});
const getYearOrderCount = asyncHandler(async (req, res) => {
  const arrayMonth = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  let d = new Date();
  let endDate = '';
  d.setDate(1);
  for (let index = 0; index < 11; index++) {
    d.setMonth(d.getMonth() - 1);
    endDate = arrayMonth[d.getMonth()] + ' ' + d.getFullYear();
  }
  const data = await Order.aggregate([
    {
      $match: {
        paidAt: {
          $lte: new Date(),
          $gte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avarage: { $avg: '$totalPriceAfterDiscount' },
        amount: { $sum: '$totalPriceAfterDiscount' },
      },
    },
  ]);
  res.json(data);
});
module.exports = {
  getYearOrderCount,
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
};
