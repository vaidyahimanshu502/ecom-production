const categoryModel = require("../models/categoryModel");
const slugify = require("slugify");

// Controller for create CATEGORY
module.exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    //Validation
    if (!name) {
      return res.status(401).json({
        success: false,
        message: "Name is Required!",
      });
    }

    //checking if category already exists
    const category = await categoryModel.findOne({ name });
    if (category) {
      return res.status(401).json({
        success: false,
        message: "Category already exists!",
      });
    }
    //if not then create
    const newCategory = await categoryModel.create({
      name: name,
      slug: slugify(name),
    });
    await newCategory.save();

    return res.status(200).json({
      success: true,
      message: "Category created successfuly!",
      newCategory,
    });
  } catch (error) {
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

// Controller for update CATEGORY
module.exports.update = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const category = await categoryModel.findByIdAndUpdate(
      id,
      {
        name: name,
        slug: slugify(name),
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Category updated successfuly!",
      category,
    });
  } catch (error) {
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

// Controller for Getting CATEGORIES
module.exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    return res.status(200).json({
      success: true,
      message: "All Categories-",
      categories,
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

// Controller for Get-Single CATEGORY
module.exports.getSingleCategory = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(404).json({
        success: false,
        message: "Invalid Category!",
      });
    }
    const category = await categoryModel.findOne({ slug });
    return res.status(200).json({
      success: true,
      message: "Category is-",
      category,
    });
  } catch (error) {
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

// Controller for delete CATEGORY
module.exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Invalid Category!",
      });
    }

    const deletedCategory = await categoryModel.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Category Deleted successfully!",
      deletedCategory,
    });
  } catch (error) {
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
