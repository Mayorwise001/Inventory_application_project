const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    content1: {
        type: String,
        required: true,
    },
    content2: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },

    stock: {
        type: Number,
        required: true,
    },

    category: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    }],
});

module.exports = mongoose.model('Product', productSchema);
