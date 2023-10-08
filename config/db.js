const mongoose = require("mongoose");
const colors = require("colors");

module.exports.connectMongo = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGOBD_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      `MongoDB Connected successfully :: ${conn.connection.host}`.bgYellow.white
    );
  } catch (error) {
    console.log(`Errors in Connecting with DB :: ${error}`.bgRed.white);
  }
};
