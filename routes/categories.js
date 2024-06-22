const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const Category = require('../models/category');
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('categoryList', { categories, title: 'Category List', activePage: '/categories' });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/create', (req, res) => {
    res.render('createCategory' , {title: 'Create Category', activePage: '/categories/create'});
});

router.post('/create', async (req, res) => {
    const { name } = req.body;
    const newCategory = new Category({ name });

    try {
        await newCategory.save();
        res.redirect('/categories');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/:id/edit', async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.render('category_edit', { category, title:'Edit Category', activePage :'/categories'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to update a category
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        await Category.findByIdAndUpdate(id, { name });
        res.redirect('/categories');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to delete a category
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Category.findByIdAndDelete(id);
        res.redirect('/categories');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;