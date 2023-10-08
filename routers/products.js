const express = require("express");
const router = express.Router();
const { checkAuthentication } = require("../middlewares/jwt_middleware");
const { isAdmin } = require("../middlewares/check_Admin");
const {
  createProduct,
  getProductController,
  getSingleProduct,
  getProductPhoto,
  deleteProduct,
  updataProduct,
  productFilterController,
  productCount_Controller,
  productList,
  search_product,
  relativeProduct,
  categoryProduct,
  braintreeTokenController,
  braintreePaymentsController,
} = require("../controllers/product_controlller");
const formidable = require("express-formidable");

// For creating product
router.post(
  "/create-product",
  checkAuthentication,
  isAdmin,
  formidable(),
  createProduct
);

//Get products
router.get("/get-product", getProductController);

// getting single product
router.get("/get-single-product/:slug", getSingleProduct);

//getting photo
router.get("/product-photo/:pid", getProductPhoto);

//delete product
router.delete(
  "/delete-product/:pid",
  checkAuthentication,
  isAdmin,
  deleteProduct
);

// update product
router.put(
  "/update-product/:id",
  checkAuthentication,
  isAdmin,
  formidable(),
  updataProduct
);

// Filter Products
router.post("/product-filter", productFilterController);

//Count products
router.get("/product-count", productCount_Controller);

//products per page
router.get("/product-list/:page", productList);

//Search product
router.get("/search-product/:keyword", search_product);

//Similor products
router.get("/related-products/:pid/:cid", relativeProduct);

//CategoryWise Product
router.get("/product-category/:slug", categoryProduct);

//payment routes
//token
router.get("/braintree/token", braintreeTokenController);

//payments
router.post(
  "/braintree/payment",
  checkAuthentication,
  braintreePaymentsController
);

module.exports = router;
