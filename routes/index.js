const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    res.redirect('/upload');
  });
router.get('/product_list', (req, res) => {
    res.redirect('/upload/product_list');
  });
router.get('/create', (req, res) => {
    res.redirect('/upload/create');
  });

module.exports = router;
