const mongoose = require('mongoose');
const dbConnect = async () => {
  await mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to Mongodb success!'))
    .catch(() => console.log('failure!'));
};
module.exports = dbConnect;
