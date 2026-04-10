const express      = require('express');
const asyncHandler = require('express-async-handler');
const Category     = require('../models/Category');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// GET all categories
router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).populate('parent', 'name');
  res.json({ success: true, categories });
}));

// POST create category
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const { name, description, parent } = req.body;

  // Convert empty string to null so Mongoose doesn't try to cast "" as ObjectId
  const cat = await Category.create({
    name,
    description,
    parent: parent && parent !== '' ? parent : null,
  });

  res.status(201).json({ success: true, category: cat });
}));

// PUT update category
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const { name, description, parent } = req.body;

  const cat = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      parent: parent && parent !== '' ? parent : null,
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, category: cat });
}));

// DELETE category
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
}));

module.exports = router;