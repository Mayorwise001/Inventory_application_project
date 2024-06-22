const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/product');
const category = require('../models/category');

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Set up Multer middleware
const upload = multer({ storage: storage });

// Route to render the upload form

router.get('/', async (req, res) => {
    try {
        const categories = await category.find();

        // Fetch product counts for each category
        const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
            const productCount = await Product.countDocuments({ category: category._id });
            return {
                ...category._doc,
                productCount
            };
        }));

        res.render('home', { title: 'Home', categories: categoriesWithCounts, activePage: '/' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await category.findById(id);
        const products = await Product.find({ category: id }).populate('category');
        res.render('categoryProducts', { products, categories , title:"Category Products", activePage:'/categories'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/product_list', async (req, res) => {
    try {
        // const products = await Product.find();
        const products = await Product.find().populate('category');
        // const categories = await category.find();
        res.render('product_list', {title:'Product List', products, activePage: '/product_list' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/create', async (req, res) => {
    try {
        const products = await Product.find();
        const categories = await category.find();
        res.render('products', {title:'Create Product', products, categories, activePage:'/upload/create'});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/create', upload.single('image'), async (req, res) => {
    const { content1, content2,price,stock, category } = req.body;
    const imagePath = req.file.path.replace('public', '');

    const newProduct = new Product({
        content1,
        content2,
        price,
        category,
        stock,
        image: imagePath,
    });

    try {
        const savedProduct = await newProduct.save();
        res.redirect('/');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Route to delete each of the uploads
router.delete('/upload/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id);
        res.redirect('/');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to handle the details of each product in the product list.
router.get('/upload/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id).populate('category');
        const categories = await category.find();
        console.log(product)
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.render('product_detail', { product, activePage:'/product_list', title:'Product Detail'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.get('/upload/:id/edit', async (req, res) => {
const { id } = req.params;
try {
    const product = await Product.findById(id);
    const categories = await category.find();
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.render('product_update', { product, categories, title:'Product Update', activePage: '/product_list' });
} catch (err) {
    res.status(500).json({ error: err.message });
}
});

router.put('/upload/:id', upload.single('image'), async (req, res) => {
const { id } = req.params;
const { content1, content2, category } = req.body;
let updateData = { content1, content2, category };

if (req.file) {
    const imagePath = req.file.path.replace('public', '');
    updateData.image = imagePath;
}

try {
    await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.redirect(`/upload/upload/${id}`);
} catch (err) {
    res.status(400).json({ error: err.message });
}
});

module.exports = router;
