# DevTools — bqthangdev.github.io

Trang web tĩnh chạy trên GitHub Pages, tập hợp các tiện ích nhỏ dành cho developer.  
Không có backend, toàn bộ xử lý chạy trên trình duyệt.

## Chức năng

| Tính năng | Mô tả |
|---|---|
| **String Length** | Paste chuỗi bất kỳ để xem tổng ký tự, ký tự không kể space, số từ và số dòng |
| **Image to Base64** | Tải lên một hoặc nhiều ảnh, chuyển đổi sang chuỗi Base64 hoặc Data URL |
| **Text Compare** | Dán hai đoạn văn bản, so sánh từng dòng và highlight chính xác các ký tự khác nhau |
| **Markdown Reader** | Tải lên file `.md` hoặc paste nội dung Markdown, xem preview với hai chế độ side-by-side và below |
| **Case Converter** | Chuyển đổi text sang camelCase, snake_case, PascalCase, kebab-case và 11 định dạng khác |

## Tính năng khác

- Chuyển đổi giao diện **Dark / Light**, lưu tuỳ chọn vào `localStorage`
- Hỗ trợ **drag & drop** ảnh
- Responsive trên màn hình nhỏ

## Công nghệ

- HTML5 / CSS3 / Vanilla JavaScript
- [marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js) — render Markdown (CDN, không cài đặt)

## Chạy local

Mở trực tiếp `index.html` trên trình duyệt, hoặc dùng Live Server trong VS Code.
