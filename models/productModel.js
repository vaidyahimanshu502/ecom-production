const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
    },
    quantity: {
      type: Number,
      required: true,
    },
    photo: {
      data: Buffer, // For storing files we need to take dataType == Buffer
      contentType: String, // We need to also provide the ContentType == String
    },
    shipping: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("products", productSchema);
module.exports = Product;
