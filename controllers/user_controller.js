const { createHashPassword, comparePassword } = require("../helpers/bcrypt");
const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const orderModel = require("../models/orderModel");

module.exports.registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, question } = req.body;
    //validations
    if (!name) {
      res.send({ message: "Name is required!" });
    }
    if (!email) {
      res.send({ message: "Email is required!" });
    }
    if (!password) {
      res.send({ message: "Password is required!" });
    }
    if (!phone) {
      res.send({ message: "Phone is required!" });
    }
    if (!address) {
      res.send({ message: "Address is required!" });
    }
    if (!question) {
      res.send({ message: "Question is required!" });
    }

    //Checking for existing USER
    const user = await UserModel.findOne({ email });

    if (!user) {
      //encrypting our password
      const hashedPassword = await createHashPassword(password);

      //creating new user
      const newUser = await UserModel.create({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
        address: address,
        question: question,
      });
      await newUser.save();

      // sending data into json format
      return res.status(200).json({
        success: true,
        message: "User Signed-Up successfully!",
        newUser,
      });
    } else {
      res.status(401).json({
        success: false,
        message: "User already exists! Please Sign-In!!",
      });
    }
  } catch (message) {
    let errMsg = message.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};

//Login Controller
module.exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validation
    if (!email || !password) {
      return res.status(401).send({
        success: false,
        message: "Invalid Username or Password!",
      });
    }

    //finding user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    //matching password
    const match = await comparePassword(password, user.password);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Invalid password!",
      });
    }

    //creating token
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      message: "Login Successfull!",
      user: user,
      token: token,
    });
  } catch (message) {
    let errMsg = message.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};

// APIs for Forgot Password
module.exports.forgotPasswordController = async (req, res) => {
  try {
    //Destructuring
    const { email, question, newPassword } = req.body;

    //validations
    if (!email) {
      return res.status(400).json({
        message: "Email Is Required!",
      });
    }
    if (!question) {
      return res.status(400).json({
        message: "Question Is Required!",
      });
    }
    if (!newPassword) {
      return res.status(400).json({
        message: "New-Password Is Required!",
      });
    }

    //Checks User info in DataBase
    const user = await UserModel.findOne({ email, question });

    //Validations
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Wrong Email/Question!",
      });
    }

    //Incrypting Password
    const hashed = await createHashPassword(newPassword);

    //Updating Password
    await UserModel.findByIdAndUpdate(user._id, {
      password: hashed,
    });
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password Updated successfuly!",
    });
  } catch (error) {
    let errMsg = error.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};

//test controller for JWT
module.exports.testController = (req, res) => {
  try {
    return res.send("<h1>Welcome to E-com Website Manni Darling!</h1>");
  } catch (message) {
    let errMsg = message.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};

//Update profile
module.exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    const user = await UserModel.findOne({ email });
    // console.log("Finded User ====", user)

    if (password && password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password is required and 6 characters long!",
      });
    }

    const hashedPassword = password
      ? await createHashPassword(password)
      : undefined;

    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      { new: true }
    );
    user.save();
    // console.log("Updated user ", updatedUser)
    return res.status(200).json({
      success: true,
      message: "Profile Updated SuccessFully!",
      updatedUser,
    });
  } catch (error) {
    let errMsg = error.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};

// Getting orders
module.exports.getOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("UserId = ", userId);
    const orders = await orderModel
      .find({ buyer: userId })
      .populate("products", "-photo")
      .populate("buyer", "name");
    return res.status(200).json({
      orders,
    });
  } catch (error) {
    let errMsg = error.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};

// All Orders
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    let errMsg = error.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};

//Api for Changing order status
module.exports.changOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const statusChanged = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    return res.json(statusChanged);
  } catch (error) {
    let errMsg = error.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server message!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};
