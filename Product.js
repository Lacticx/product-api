const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    pid: { type: String, required: true, unique: true },
    pname: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

module.exports = mongoose.model('Product', ProductSchema);