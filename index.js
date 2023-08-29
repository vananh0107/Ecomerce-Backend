const express = require('express');
const dbConnect = require('./config/dbConnect');
const bodyParser = require('body-parser');
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoute');
const productRouter = require('./routes/productRoute');
const blogRouter = require('./routes/blogRoute');
const categoryRouter = require('./routes/prodCatRoute');
const blogcategoryRouter = require('./routes/blogCatRoute');
const couponRouter = require('./routes/couponRoute');
const brandRouter = require('./routes/brandRoute');
const uploadRoute = require('./routes/uploadRoute');
const { notFound, errorHandler } = require('./middlewares/errHandler');
const morgan = require('morgan');
dbConnect();
app.use(
  cors({
    origin: '*',
  })
);
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/prodcategory', categoryRouter);
app.use('/api/blogcategory', blogcategoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/upload', uploadRoute);
app.use('/api/coupon', couponRouter);
app.use(notFound);
app.use(errorHandler);
app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port http://localhost:${process.env.PORT}`);
});
