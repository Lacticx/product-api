# 1. Chọn Base Image chứa môi trường Node.js bản nhẹ (Alpine Linux)
FROM node:20-alpine

# 2. Thiết lập thư mục làm việc mặc định bên trong container
WORKDIR /app

# 3. Sao chép file quản lý thư viện vào trước để tận dụng bộ nhớ đệm (Docker Cache)
COPY package*.json ./

# 4. Cài đặt các thư viện cần thiết
RUN npm install

# 5. Sao chép toàn bộ mã nguồn còn lại của dự án vào trong container
COPY . .

# 6. Khai báo cổng mà ứng dụng bên trong container sẽ lắng nghe
EXPOSE 3000

# 7. Lệnh khởi chạy ứng dụng khi container bắt đầu hoạt động
CMD ["npm", "start"]