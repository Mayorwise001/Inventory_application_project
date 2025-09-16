import express from "express";
import  mongoose from 'mongoose';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import path from 'path';
import Category from '../models/category.js';
const router = express.Router();
import authMiddleware from "../middleware/auth.js";


router.get('/',authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('categoryList', { categories, title: 'Category List', activePage: '/categories' });
        
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/create',authMiddleware, async (req, res) => {
    res.render('createCategory' , {title: 'Create Category', activePage: '/categories/create'});
});

router.post('/create',authMiddleware, async (req, res) => {
    const { name } = req.body;
    const newCategory = new Category({ name });

    try {
        await newCategory.save();
        res.redirect('/categories');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/:id/edit',authMiddleware,async (req, res) => {
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
router.put('/:id',authMiddleware, async (req, res) => {
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
router.delete('/:id',authMiddleware,async (req, res) => {
    const { id } = req.params;
    try {
        await Category.findByIdAndDelete(id);
        res.redirect('/categories');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
export default router;