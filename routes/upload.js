import express from "express";
const router = express.Router();
import multer from 'multer';
import path from 'path';
import Product from  '../models/product.js';
import category from  '../models/category.js';
import bcrypt from  "bcryptjs";
import jwt from  "jsonwebtoken";
import User from  "../models/userModel.js";
import authMiddleware from "../middleware/auth.js";

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

router.get('/home',authMiddleware , async (req, res) => {
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

router.get("/", async (req, res) => {
    res.render("main");
})


router.get("/login", async (req, res) => {
    res.render("login");
})


router.get("/signup", async (req, res) => {
    res.render("signup");
})



router.get('/categories/:id',authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const categories = await category.findById(id);
        const products = await Product.find({ category: id }).populate('category');
        res.render('categoryProducts', { products, categories , title:"Category Products", activePage:'/categories'});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.get('/product_list' , authMiddleware, async (req, res) => {
    try {
        // const products = await Product.find();
        const products = await Product.find().populate('category');
        // const categories = await category.find();
        res.render('product_list', {title:'Product List', products, activePage: '/product_list' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/create' , authMiddleware, async (req, res) => {
    try {
        const products = await Product.find();
        const categories = await category.find();
        res.render('products', {title:'Create Product', products, categories, activePage:'/upload/create'});

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/create' , authMiddleware, upload.single('image'), async (req, res) => {
    const { content1, content2,price,stock, category } = req.body;


    const newProduct = new Product({
        content1,
        content2,
        price,
        category,
        stock,
     
    });

    try {
        const savedProduct = await newProduct.save();
        res.redirect('/upload/home');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Route to delete each of the uploads
router.delete('/upload/:id' , authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        await Product.findByIdAndDelete(id);
        res.redirect('/upload/home');
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to handle the details of each product in the product list.
router.get('/upload/:id' , authMiddleware, async (req, res) => {
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



router.get('/upload/:id/edit' , authMiddleware, async (req, res) => {
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

router.put('/upload/:id' , authMiddleware, upload.single('image'), async (req, res) => {
const { id } = req.params;
console.log('Request body:', req.body);
const { content1, content2, category, stock, avail } = req.body;
let updateData = { content1, content2, category, stock, avail };

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


// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, confirmPassword } = req.body;

    // 1. Validate input
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      return res.render("signup", { message: "All fields are required", success: false });
    }

    if (password !== confirmPassword) {
      return res.render("signup", { message: "Passwords do not match", success: false });
    }

    // 2. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", { message: "Email already registered", success: false });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save new user
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // 5. Render with success message
    return res.render("signup", { message: "Signup successful 🎉", success: true });

  } catch (err) {
    console.error(err);
    res.render("signup", { message: "Server error", success: false });
  }
});


// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

        // 5. Store token in secure HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true, // prevents JS access
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "strict",
    
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only over HTTPS in production
    sameSite: "Strict",
  });

 return res.redirect("/"); // redirect directly from backend
});


export default router;
