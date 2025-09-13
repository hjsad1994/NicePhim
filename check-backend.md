# Hướng dẫn kiểm tra và khắc phục lỗi đăng ký

## 1. Kiểm tra Backend có đang chạy không

### Chạy Backend:
```bash
cd nicephim-backend/demo
./mvnw spring-boot:run
```

### Kiểm tra Backend:
- Mở browser và truy cập: `http://localhost:8080`
- Hoặc test API: `http://localhost:8080/api/auth/register`

## 2. Kiểm tra Database

### Đảm bảo SQL Server đang chạy:
- Server: `KARIU:1435`
- Database: `nicephim`
- Username: `sa`
- Password: `Aa@123`

### Kiểm tra bảng users:
```sql
SELECT * FROM dbo.users;
```

## 3. Test API trực tiếp

### Sử dụng curl:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "displayName": "Test User"
  }'
```

### Sử dụng Postman:
- URL: `POST http://localhost:8080/api/auth/register`
- Headers: `Content-Type: application/json`
- Body: JSON với username, email, password, displayName

## 4. Kiểm tra Frontend

### Chạy Frontend:
```bash
cd rophim-frontend
npm run dev
```

### Test trang debug:
- Truy cập: `http://localhost:3000/test-api`
- Click "Test Direct Connection" và "Test API Service"

## 5. Các lỗi thường gặp

### Lỗi CORS:
- Kiểm tra WebCorsConfig.java
- Đảm bảo `allowedOrigins("*")` được cấu hình

### Lỗi Database:
- Kiểm tra connection string trong application.properties
- Đảm bảo database `nicephim` đã được tạo
- Chạy Flyway migration

### Lỗi Network:
- Kiểm tra firewall
- Đảm bảo port 8080 không bị chiếm dụng
- Kiểm tra kết nối mạng

## 6. Debug Steps

1. Mở Developer Tools (F12)
2. Vào tab Console để xem lỗi JavaScript
3. Vào tab Network để xem HTTP requests
4. Kiểm tra Response status và data

## 7. Logs để kiểm tra

### Backend logs:
- Xem console khi chạy Spring Boot
- Tìm các lỗi database hoặc validation

### Frontend logs:
- Console.log trong browser
- Network requests trong DevTools


