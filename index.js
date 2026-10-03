require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./Product');

const app = express();
app.use(express.json());

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối thành công đến MongoDB (container nammongodb)'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));
// API Healthcheck dành riêng cho Docker
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// --- CÁC API CRUD ---

// 1. CREATE: Thêm sản phẩm mới
app.post('/products', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 2. READ: Lấy danh sách tất cả sản phẩm
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. UPDATE: Cập nhật sản phẩm theo pid
app.put('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate({ pid: req.params.pid }, req.body, { new: true });
        if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. DELETE: Xóa sản phẩm theo pid
app.delete('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ pid: req.params.pid });
        if (!product) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
        res.json({ message: 'Đã xóa sản phẩm thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Khởi động server
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server Product API đang chạy tại cổng ${port}`);
});