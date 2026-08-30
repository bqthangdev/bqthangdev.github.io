# DevTools — bqthangdev.github.io

Trang web tĩnh chạy trên GitHub Pages, tập hợp các tiện ích nhỏ dành cho developer.  
Không có backend, toàn bộ xử lý chạy trên trình duyệt.

## Chức năng

| Tính năng | Mô tả |
|---|---|
| **Markdown Reader** | Tải lên file `.md` hoặc paste nội dung Markdown; hai chế độ xem (lưu `localStorage`): **Side by side** có Sync scroll hai chiều (mặc định bật); **Focus** (mặc định tắt) ẩn tiêu đề ở cả Side by side và Below; editor nền trắng (light); Memory mode; xuất PDF |
| **String Length** | Paste chuỗi bất kỳ để xem tổng ký tự, ký tự không kể space, số từ và số dòng |
| **Image to Base64** | Tải lên một hoặc nhiều ảnh, chuyển đổi sang chuỗi Base64 hoặc Data URL |
| **Text Compare** | Dán hai đoạn văn bản, so sánh từng dòng và highlight chính xác các ký tự khác nhau |
| **Case Converter** | Chuyển đổi text sang camelCase, snake_case, PascalCase, kebab-case và 11 định dạng khác |
| **Settings** | Quản lý theme Dark/Light và cài đặt `localStorage` của tool (Markdown Reader: view mode, Sync scroll, Focus, Memory On/Off, Clear saved content); nút reset về mặc định |
| **Changelog** | Nhật ký hiệu chỉnh theo từng lần cập nhật |
| **About** | Thông tin tác giả |

## Tính năng khác

- Chuyển đổi giao diện **Dark / Light** (sidebar hoặc Settings), lưu vào `localStorage`
- Markdown Reader hỗ trợ **Memory mode** để tự lưu và khôi phục nội dung editor trên cùng trình duyệt
- Markdown Reader nhớ chế độ xem **Side by side / Below**, **Sync scroll** (chỉ Side by side) và **Focus** (cả hai chế độ) qua `localStorage`
- Tab **Settings** quản lý theme và cài đặt tool; Memory dùng nút On/Off; Clear saved content làm mờ khi Memory Off
- Giữ tool đang mở bằng tham số URL `tool`; nếu không có param thì mặc định mở **Markdown Reader**
- Sidebar có ghi chú nhắc nhấn **Ctrl + F5** khi trang hiển thị lỗi hoặc bất thường
- Hỗ trợ **drag & drop** ảnh
- Responsive trên màn hình nhỏ

## Công nghệ

- HTML5 / CSS3 / Vanilla JavaScript
- [marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js) — render Markdown (CDN, không cài đặt)

## Chạy local

Mở trực tiếp `index.html` trên trình duyệt, hoặc dùng Live Server trong VS Code.
