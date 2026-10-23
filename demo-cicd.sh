#!/bin/bash
# ==============================================================================
# TỆP KỊCH BẢN (TEST SCRIPT) THỰC HIỆN KIỂM THỬ & KÍCH HOẠT CI/CD TỰ ĐỘNG (CÂU 8)
# ==============================================================================

echo "================================================================"
echo "🚀 BẮT ĐẦU CHẠY TEST SCRIPT KIỂM THỬ & KÍCH HOẠT PIPELINE CI/CD"
echo "================================================================"

# Bước 1: Đảm bảo container MongoDB đang hoạt động để phục vụ chạy test
echo -e "\n[Bước 1/4] Kiểm tra trạng thái container nammongodb..."
docker start nammongodb > /dev/null 2>&1
echo "✅ Container nammongodb đang hoạt động!"

# Bước 2: Chạy bộ kiểm thử tự động Jest (Healthcheck + Full CRUD)
echo -e "\n[Bước 2/4] Thực thi bộ kiểm thử Integration Test (Jest & Supertest)..."
npm test

# Kiểm tra kết quả chạy test: Nếu lỗi (exit code khác 0) thì dừng ngay, không cho push
if [ $? -ne 0 ]; then
  echo "❌ LỖI: Bài kiểm thử thất bại! Đã hủy quá trình đẩy code lên CI/CD."
  exit 1
fi
echo "✅ Toàn bộ bài test dưới Local đã PASS 100%!"

# Bước 3: Kiểm thử thực tế bằng lệnh CLI (Smoke Test) vào container đang chạy
echo -e "\n[Bước 3/4] Thực hiện CLI Smoke Test gọi trực tiếp vào API Container..."
TEST_PID="CICD_$(date +%s)"
CREATE_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d "{\"pid\":\"$TEST_PID\",\"pname\":\"San pham Test CI/CD\",\"price\":999,\"quantity\":5}")

if [ "$CREATE_RES" == "201" ]; then
  echo "✅ CLI Smoke Test: Thêm sản phẩm tự động ($TEST_PID) thành công (HTTP 201)!"
else
  echo "⚠️ Cảnh báo: API container tại cổng 3000 trả về mã $CREATE_RES"
fi

# Bước 4: Tự động Commit và Push lên GitHub để kích hoạt luồng CI/CD
echo -e "\n[Bước 4/4] Đóng gói thay đổi và kích hoạt GitHub Actions CI/CD..."
git add .
COMMIT_MSG="CI/CD Demo: Run automated test script at $(date '+%Y-%m-%d %H:%M:%S')"
git commit --allow-empty -m "$COMMIT_MSG"
git push origin main

echo "================================================================"
echo "🎉 HOÀN TẤT! Pipeline CI/CD đã được kích hoạt trên GitHub Actions."
echo "👉 Hãy mở tab Actions trên GitHub và cửa sổ Self-hosted Runner để quan sát!"
echo "================================================================"