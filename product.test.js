const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');
const Product = require('./models/Product');

// Tăng giới hạn thời gian chờ của Jest lên 20 giây
jest.setTimeout(20000);

beforeAll(async () => {
  // Dùng trực tiếp 127.0.0.1:27017 cho cả máy cá nhân và máy ảo GitHub Actions
  const testUri = 'mongodb://127.0.0.1:27017/productdb_test';
  await mongoose.connect(testUri, { serverSelectionTimeoutMS: 5000 });
  await Product.deleteMany({});
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await Product.deleteMany({});
    await mongoose.connection.close();
  }
});

describe('Kiểm thử thực tế CRUD Product API với MongoDB', () => {
  
  test('1. [HEALTH] GET /health - Phải trả về trạng thái UP và Connected', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.db).toBe('Connected');
  });

  test('2. [CREATE] POST /api/products - Tạo mới sản phẩm thành công', async () => {
    const newProduct = { pid: 'P100', pname: 'Chuot Gaming', price: 800, quantity: 25 };
    const res = await request(app).post('/api/products').send(newProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body.pid).toBe('P100');
    expect(res.body.pname).toBe('Chuot Gaming');
  });

  test('3. [READ] GET /api/products/:pid - Lấy đúng thông tin sản phẩm vừa tạo', async () => {
    const res = await request(app).get('/api/products/P100');
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(800);
    expect(res.body.quantity).toBe(25);
  });

  test('4. [UPDATE] PUT /api/products/:pid - Cập nhật giá và số lượng sản phẩm', async () => {
    const res = await request(app)
      .put('/api/products/P100')
      .send({ price: 750, quantity: 20 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(750);
    expect(res.body.quantity).toBe(20);
  });

  test('5. [DELETE] DELETE /api/products/:pid - Xóa sản phẩm thành công', async () => {
    const res = await request(app).delete('/api/products/P100');
    expect(res.statusCode).toBe(200);

    const checkRes = await request(app).get('/api/products/P100');
    expect(checkRes.statusCode).toBe(404);
  });

});