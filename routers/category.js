const express = require("express");
const { checkAuthentication } = require("../middlewares/jwt_middleware");
const { isAdmin } = require("../middlewares/check_Admin");
const {
  create,
  update,
  getCategories,
  getSingleCategory,
  deleteCategory,
} = require("../controllers/category_controller");
const router = express.Router();

//create category
router.post("/create-category", checkAuthentication, isAdmin, create);

//update category
router.put("/update-category/:id", checkAuthentication, isAdmin, update);

//get all categories
router.get("/all-categories", getCategories);

//single Category
router.get("/single-category/:slug", getSingleCategory);

//delete-category
router.delete(
  "/delete-category/:id",
  checkAuthentication,
  isAdmin,
  deleteCategory
);

module.exports = router;
