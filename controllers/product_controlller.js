const slugify = require("slugify");
const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const orderModel = require("../models/orderModel");
const fs = require("fs");
const braintree = require("braintree");

//Payment Getway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.MERCHANT_ID,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
});
// console.log("Public key = ", process.env.BRAINTREE_PUBLIC_KEY);

//Braintree token controller
module.exports.braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        return res.status(500).json({
          success: false,
          err,
        });
      } else {
        return res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//Braintree payment controller
module.exports.braintreePaymentsController = async (req, res) => {
  try {
    const { cart, nonce, userId } = req.body; // nonce is the name provided by the documentation of Braintree.
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        console.log(userId);
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: userId,
          }).save();
          return res.json({ ok: true });
        } else {
          return res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

// Controller for Creating Product
module.exports.createProduct = async (req, res) => {
  try {
    //Destructuring datas
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //Validations
    switch (true) {
      case !name:
        return res.status(404).json({
          success: false,
          message: "Name is required!",
        });
      case !description:
        return res.status(404).json({
          success: false,
          message: "description is required!",
        });
      case !price:
        return res.status(404).json({
          success: false,
          message: "Price is required!",
        });
      case !category:
        return res.status(404).json({
          success: false,
          message: "Category is required!",
        });
      case !quantity:
        return res.status(404).json({
          success: false,
          message: "Quantity is required!",
        });
      case photo && photo.size > 1000000:
        return res.status(404).json({
          success: false,
          message: "Photo is required and should be less than 1Mb!",
        });
    }
    const product = new productModel({
      ...req.fields,
      slug: slugify(name),
    });
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    res.status(200).json({
      success: true,
      message: "Product created successfuly!",
      product,
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

// Controller for Getting All Products
module.exports.getProductController = async (req, res) => {
  try {
    const products = await productModel
      .find({}) // Finding in database.
      .populate("category") // Passing Category instead of category Id.
      .select("-photo") // excluding photo
      .limit(12) // Seting how much item can show at a time.
      .sort({ createdAt: -1 }); // Seting which items has to be seen first.

    return res.status(200).json({
      success: true,
      message: "All products list -",
      products,
      total: products.length,
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

// Controller for Getting Product
module.exports.getSingleProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(401).json({
        success: false,
        message: "Invalid Identifier!",
      });
    }

    const product = await productModel
      .findOne({ slug })
      .select("-photo")
      .populate("category");

    return res.status(200).json({
      success: true,
      message: "Seached product is -",
      product,
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

// Controller for Getting Product Photo
module.exports.getProductPhoto = async (req, res) => {
  try {
    // console.log(req.params)
    const { pid } = req.params;
    if (!pid) {
      return res.status(400).json({
        success: false,
        message: "Invalid pid!",
      });
    }

    const productPhoto = await productModel.findById(pid).select("photo"); // Getting photo only

    if (productPhoto.photo.data) {
      res.set("Content-type", productPhoto.photo.contentType);
      return res.status(200).send(productPhoto.photo.data);
    }
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

// Controller for Deleting Product
module.exports.deleteProduct = async (req, res) => {
  try {
    console.log(req.params.pid);
    const { pid } = req.params;
    if (!pid) {
      return res.status(400).json({
        success: false,
        message: "Invalid product!",
      });
    }

    await productModel.findByIdAndDelete(pid).select("-photo");
    return res.status(200).json({
      success: true,
      message: "Product deleted successfuly!",
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

// Controller for Updating Product
module.exports.updataProduct = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.fields);
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    //Validations
    switch (true) {
      case !name:
        return res.status(404).json({
          success: false,
          message: "Name is required!",
        });
      case !description:
        return res.status(404).json({
          success: false,
          message: "description is required!",
        });
      case !price:
        return res.status(404).json({
          success: false,
          message: "Price is required!",
        });
      case !category:
        return res.status(404).json({
          success: false,
          message: "Category is required!",
        });
      case !quantity:
        return res.status(404).json({
          success: false,
          message: "Quantity is required!",
        });
      case photo && photo.size > 1000000:
        return res.status(404).json({
          success: false,
          message: "Photo is required and should be less than 1Mb!",
        });
    }
    const product = await productModel.findByIdAndUpdate(
      id,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );
    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }
    await product.save();
    res.status(200).json({
      success: true,
      message: "Product updated successfuly!",
      product,
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

//Filters logics
module.exports.productFilterController = async (req, res) => {
  try {
    //getting values from front-end
    const { checked, radio } = req.body;
    //creating variables for checked and radio from front-end
    let args = {};
    //checking for checkbox bcz it can be multiple
    if (checked.length > 0) {
      args.category = checked;
    }
    // checking for Radio and since it can be select one at a time
    if (radio.length) {
      args.price = { $gte: radio[0], $lte: radio[1] }; // mongoDB query for verifying price with price getting from front-end
    }
    //finding products in DB based on args
    const products = await productModel.find(args);
    return res.status(200).send({
      success: true,
      message: " List Of Filtered-Products!",
      products,
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

//Product count
module.exports.productCount_Controller = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();
    return res.status(200).send({
      success: true,
      total,
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

//getting prducts per page
module.exports.productList = async (req, res) => {
  try {
    const perPage = 4;
    const page = req.params.page ? req.params.page : 1;
    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      products,
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

//Search product
module.exports.search_product = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } }, //MongoDB queries for searching by keywords
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");
    return res.status(200).json({
      success: true,
      results,
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

//Relative product controller
module.exports.relativeProduct = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid }, // removing clicked product from the list of search
      })
      .select("-photo")
      .limit(4)
      .populate("category");

    return res.status(200).json({
      success: true,
      message: "Related products-",
      products,
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

// Getting product category Wise
module.exports.categoryProduct = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    return res.status(200).json({
      success: true,
      message: "Products list by category-",
      category,
      products,
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
