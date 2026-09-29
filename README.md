# DevTools

Bộ công cụ chạy trên trình duyệt cho các thao tác với Markdown, văn bản và ảnh. Trang tĩnh, không có backend: mọi xử lý diễn ra trên máy bạn.

## Bắt đầu

Mở bản đã deploy, hoặc mở `index.html` trực tiếp trên trình duyệt. Trong VS Code có thể dùng Live Server.

Tool đang mở được giữ bằng query `?tool=`. Không có tham số thì trang mở **Markdown Reader**.

Ví dụ: `index.html?tool=encode-decode`

## Giao diện

### Theme

Dark hoặc Light. Đổi ở cuối sidebar, hoặc trong **Settings**. Lựa chọn được lưu trên trình duyệt. Mặc định là Dark.

### Sidebar

Sidebar nằm bên trái. Nút **«** ở giữa mép phải sidebar để ẩn; khi đang ẩn, nút **»** ở giữa mép trái màn hình để hiện lại. Cùng tùy chọn này có trong **Settings**. Mặc định là hiện.

Trên màn hình hẹp, sidebar thu còn cột icon.

## Công cụ

Chọn tool trên sidebar. Mỗi tool có mục **Hướng dẫn sử dụng** ngay trên trang.

### Markdown Reader

Đọc và xem trước Markdown. Tải file `.md` hoặc dán nội dung vào editor. Preview cập nhật khi bạn gõ.

Hai cách bố trí:

- **Side by side** — editor và preview nằm cạnh nhau, vừa chiều cao màn hình. Cuộn chỉ trong từng khung, không cuộn cả trang. **Sync scroll** (mặc định bật) đồng bộ tỷ lệ cuộn hai chiều; tắt thì mỗi khung cuộn riêng. Kéo thanh giữa để đổi độ rộng (mặc định 50/50, không được lưu).
- **Below** — editor nằm trên preview. Editor mặc định thu gọn khoảng hai dòng; nhấn nhãn **Markdown** để mở rộng hoặc thu gọn. Khi cuộn trang, thanh công cụ giữ nguyên vị trí ban đầu, không dính sát mép màn hình. Tiêu đề trang vẫn cuộn đi.

**Focus** (mặc định tắt) ẩn tiêu đề và hướng dẫn ở cả hai cách bố trí, để chừa chỗ cho editor và preview.

**Memory** lưu nội dung editor trên trình duyệt và khôi phục khi tải lại trang. **Clear memory** xóa bản đã lưu. Khi Memory tắt, nút xóa không dùng được.

**Download .md** tải nội dung editor. **Export PDF** mở hộp thoại in của trình duyệt để xuất preview.

### String Length

Dán hoặc gõ một chuỗi. Trang hiển thị tổng số ký tự, số ký tự không kể khoảng trắng, số từ và số dòng. Số liệu cập nhật khi bạn nhập.

### Image to Base64

Tải một hoặc nhiều ảnh (nhấn vùng upload hoặc kéo thả). Mỗi ảnh có kết quả riêng, dạng chuỗi Base64 hoặc Data URL. Có thể sao chép hoặc tải về file `.txt`.

Định dạng thường gặp: PNG, JPG, GIF, WebP, SVG.

### Text Compare

Dán hai đoạn vào **Text A** và **Text B**, rồi nhấn **Compare**. Kết quả so từng dòng: thêm, xóa, hoặc sửa. Trong dòng sửa, từng ký tự khác nhau được đánh dấu.

### Case Converter

Dán văn bản vào ô trái, rồi chọn một kiểu chữ. Mỗi dòng được xử lý riêng. Kết quả hiện ở ô phải. Có thể sao chép hoặc xóa.

Chữ tiếng Việt được giữ nguyên, kể cả dấu và đ. Ví dụ `Xin chào Việt Nam` sang snake_case thành `xin_chào_việt_nam`, sang camelCase thành `xinChàoViệtNam`. Chữ tiếng Anh vẫn đổi như thường (`helloWorld` thành `hello_world`).

Các kiểu: lowercase, UPPERCASE, camelCase, Capital Case, CONSTANT_CASE, dot.case, kebab-case, no case, PascalCase, Pascal_Snake_Case, path/case, Sentence case, snake_case, sWAP cASE, Train-Case.

### Encode / Decode

Chuyển văn bản theo loại mã chọn ở **Type**. Mặc định là **Unicode**.

- **Encode** (mặc định) và **Decode** là chế độ làm việc. Đổi chế độ không xóa nội dung. Gõ hoặc dán vào **Input** (trái); **Result** (phải) cập nhật sau một khoảng ngắn.
- Input tối đa 256 KB (UTF-8). Phần vượt quá bị cắt và có thông báo.
- Unicode: encode thành `\uXXXX`; decode đọc `\uXXXX` và `\u{...}`.
- MD5, SHA1, SHA3 (256), SHA3 (512), SHA256, SHA512 chỉ có Encode. Decode bị tắt.
- **⇄** đổi nội dung hai ô và đảo Encode / Decode. Với hàm băm, chỉ đổi nội dung và giữ Encode.
- **Focus** ẩn tiêu đề để tăng chiều cao hai ô. Mặc định tắt.

## Settings

**Settings** gom các lựa chọn đang được lưu trên trình duyệt:

- Theme và Sidebar
- Markdown Reader: cách bố trí, Sync scroll, Focus, Memory
- Encode / Decode: Type, Encode/Decode, Focus

**Reset all to defaults** xóa các lựa chọn đã lưu và khôi phục mặc định: theme Dark, sidebar hiện, Markdown Reader về Side by side với Sync scroll bật và Focus tắt, Encode / Decode về Unicode, Encode, Focus tắt.

## Nếu trang hiển thị lỗi

Sidebar có ghi chú: nhấn **Ctrl + F5** để tải lại và bỏ bản cache cũ.

## Công nghệ

- HTML, CSS, JavaScript (không framework, không bước build)
- [marked.js](https://cdn.jsdelivr.net/npm/marked/marked.min.js) — render Markdown
- [crypto-js](https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js) — MD5 và SHA cho Encode / Decode
