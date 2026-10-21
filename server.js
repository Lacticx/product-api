require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
app.use(express.json()); // Cho phép đọc dữ liệu JSON từ body của request

// 1. Kết nối tới MongoDB Container (nammongodb)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối thành công tới MongoDB (nammongodb)!'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err.message));

  // [HEALTHCHECK] Kiểm tra trạng thái hoạt động của API và kết nối MongoDB
app.get('/health', (req, res) => {
  // readyState === 1 nghĩa là Mongoose đang kết nối tốt với MongoDB
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'UP', db: 'Connected' });
  } else {
    res.status(500).json({ status: 'DOWN', db: 'Disconnected' });
  }
});
// 2. Các API CRUD cho Product

// [CREATE] Thêm mới sản phẩm (POST /api/products)
app.post('/api/products', async (req, res) => {
  try {
    const { pid, pname, price, quantity } = req.body;
    const newProduct = new Product({ pid, pname, price, quantity });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// [READ ALL] Lấy danh sách tất cả sản phẩm (GET /api/products)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [READ ONE] Lấy chi tiết 1 sản phẩm theo pid (GET /api/products/:pid)
app.get('/api/products/:pid', async (req, res) => {
  try {
    const product = await Product.findOne({ pid: req.params.pid });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// [UPDATE] Cập nhật sản phẩm theo pid (PUT /api/products/:pid)
app.put('/api/products/:pid', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { pid: req.params.pid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// [DELETE] Xóa sản phẩm theo pid (DELETE /api/products/:pid)
app.delete('/api/products/:pid', async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ pid: req.params.pid });
    if (!deletedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.status(200).json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Khởi chạy Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});