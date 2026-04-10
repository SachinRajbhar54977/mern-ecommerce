const express = require('express');
const router  = express.Router();
const {
  getProducts, getProduct, getProductBySlug, getFeaturedProducts,
  createProduct, updateProduct, deleteProduct, getRelatedProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { upload }         = require('../config/cloudinary');

router.get('/',              getProducts);
router.get('/featured',      getFeaturedProducts);
router.get('/slug/:slug',    getProductBySlug);
router.get('/:id',           getProduct);
router.get('/:id/related',   getRelatedProducts);

router.post('/',    protect, admin, upload.array('images', 5), createProduct);
router.put('/:id',  protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
