const express = require("express");

const { addCategory, deleteCategory, listCategory, searchCategory, updateCategory } = require("./category");

const { addProduct, deleteProduct, listProduct, searchProduct, updateProduct } = require("./product");

const router = express.Router();

router.get("/category", listCategory);
router.get("/category/search", searchCategory);
router.post("/category", addCategory);
router.put("/category", updateCategory);
router.delete("/category", deleteCategory);

router.get("/product", listProduct);
router.get("/product/search", searchProduct);
router.post("/product", addProduct);
router.put("/product", updateProduct);
router.delete("/product", deleteProduct);

module.exports = {
  router,
};
