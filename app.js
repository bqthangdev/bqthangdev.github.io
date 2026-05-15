/* ═══════════════════════════════════════════════════════════════
   app.js — DevTools
   Cấu trúc:
     1. Theme     — dark/light, lưu localStorage, áp dụng trước render
     2. Navigation — chuyển section trong sidebar
     3. Toast      — thông báo ngắn tự ẩn
     4. String Length  — đếm ký tự theo thời gian thực
     5. Image to Base64 — chuyển ảnh sang base64 / data URL
═══════════════════════════════════════════════════════════════ */


/* ─── 1. THEME ──────────────────────────────────────────────────
   Áp dụng class 'light' lên <body> ngay khi script load (trước
   khi trình duyệt vẽ trang) để tránh flash màu sai.
─────────────────────────────────────────────────────────────── */
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') document.body.classList.add('light');

/** Cập nhật icon và label của nút toggle theo chế độ hiện tại */
function applyThemeIcons(mode) {
  const isLight = mode === 'light';
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon)  icon.textContent  = isLight ? '🌙' : '☀️';
  if (label) label.textContent = isLight ? 'Dark mode' : 'Light mode';
}

document.addEventListener('DOMContentLoaded', () => {

  /* Đồng bộ icon với trạng thái đã được áp dụng ở trên */
  applyThemeIcons(document.body.classList.contains('light') ? 'light' : 'dark');

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    const mode = isLight ? 'light' : 'dark';
    localStorage.setItem('theme', mode); // lưu để giữ khi reload
    applyThemeIcons(mode);
  });


  /* ─── 2. NAVIGATION ──────────────────────────────────────────
     Khi click nav item:
       - Cập nhật class 'active' trên các button sidebar
       - Ẩn section đang hiển thị, hiện section tương ứng
     Liên kết giữa button và section qua attribute data-page
     và id của section (id = "page-" + data-page).
  ─────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      /* Đổi active trên nav */
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      /* Hiển thị đúng section */
      const target = btn.dataset.page;
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById('page-' + target).classList.add('active');
    });
  });


  /* ─── 4. STRING LENGTH ───────────────────────────────────────
     Lắng nghe sự kiện 'input' trên textarea để cập nhật realtime.
     Tính 4 chỉ số: tổng ký tự, ký tự không kể whitespace,
     số từ (split whitespace), số dòng (split '\n').
  ─────────────────────────────────────────────────────────────── */
  const slInput   = document.getElementById('sl-input');
  const slTotal   = document.getElementById('sl-total');
  const slNoSpace = document.getElementById('sl-no-spaces');
  const slWords   = document.getElementById('sl-words');
  const slLines   = document.getElementById('sl-lines');

  function updateStats() {
    const val = slInput.value;
    slTotal.textContent   = val.length;
    slNoSpace.textContent = val.replace(/\s/g, '').length;
    slWords.textContent   = val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
    slLines.textContent   = val === '' ? 0 : val.split('\n').length;
  }

  slInput.addEventListener('input', updateStats);

  /* Xóa toàn bộ nội dung và reset số đếm */
  document.getElementById('sl-clear').addEventListener('click', () => {
    slInput.value = '';
    updateStats();
  });

  /* Copy số ký tự vào clipboard */
  document.getElementById('sl-copy').addEventListener('click', () => {
    const len = slInput.value.length.toString();
    navigator.clipboard.writeText(len).then(() => showToast(`Copied: ${len} characters`));
  });


  /* ─── 5. IMAGE TO BASE64 ─────────────────────────────────────
     Hỗ trợ cả click (mở file picker) lẫn drag & drop.
     Mỗi ảnh được đọc bằng FileReader.readAsDataURL(), kết quả
     hiển thị dạng card với thumbnail, thông tin file và nút copy.
  ─────────────────────────────────────────────────────────────── */
  const ibInput    = document.getElementById('ib-input');
  const ibDropzone = document.getElementById('ib-dropzone');

  /* Click vào drop zone → mở file picker */
  ibDropzone.addEventListener('click', () => ibInput.click());

  /* Drag over: ngăn hành vi mặc định + thêm class highlight */
  ibDropzone.addEventListener('dragover', e => {
    e.preventDefault();
    ibDropzone.classList.add('drag-over');
  });
  ibDropzone.addEventListener('dragleave', () => ibDropzone.classList.remove('drag-over'));

  /* Drop: xử lý file từ dataTransfer */
  ibDropzone.addEventListener('drop', e => {
    e.preventDefault();
    ibDropzone.classList.remove('drag-over');
    processFiles(e.dataTransfer.files);
  });

  /* Chọn file qua input (reset value để có thể chọn lại cùng file) */
  ibInput.addEventListener('change', () => {
    processFiles(ibInput.files);
    ibInput.value = '';
  });

}); // end DOMContentLoaded


/* ─── 3. TOAST ──────────────────────────────────────────────────
   Hiển thị thông báo ngắn ở góc phải bên dưới, tự ẩn sau 2.2s.
   Dùng chung cho cả String Length và Image to Base64.
─────────────────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}


/* ─── IMAGE TO BASE64: helpers ──────────────────────────────────
   Tách ra ngoài DOMContentLoaded vì được gọi từ callback của
   FileReader (bất đồng bộ).
─────────────────────────────────────────────────────────────── */

/** Định dạng kích thước file: B → KB → MB */
function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/** Lặp qua danh sách file, bỏ qua file không phải ảnh */
function processFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast(`"${file.name}" is not an image.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => renderResult(file, e.target.result);
    reader.readAsDataURL(file); // kết quả là "data:image/png;base64,..."
  });
}

/** Tạo card kết quả và gắn event cho nút copy Base64 / copy Data URL / xóa */
function renderResult(file, dataUrl) {
  const id = 'res-' + Math.random().toString(36).slice(2, 9);

  const item = document.createElement('div');
  item.className = 'result-item';
  item.id = id;

  /* Dùng escapeHtml để ngăn XSS nếu tên file chứa ký tự đặc biệt */
  item.innerHTML = `
    <div class="result-header">
      <img class="result-thumb" src="${dataUrl}" alt="${escapeHtml(file.name)}" />
      <div class="result-meta">
        <div class="result-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
        <div class="result-size">${formatBytes(file.size)} &bull; ${file.type}</div>
      </div>
      <div class="result-actions">
        <button class="btn btn-primary  btn-copy-b64" data-id="${id}">Copy Base64</button>
        <button class="btn btn-secondary btn-copy-url" data-id="${id}">Copy Data URL</button>
        <button class="btn btn-secondary btn-remove"   data-id="${id}">✕</button>
      </div>
    </div>
    <div class="result-box" data-full="${escapeAttr(dataUrl)}">${escapeHtml(dataUrl.substring(0, 300))}${dataUrl.length > 300 ? '…' : ''}</div>
  `;

  /* Copy chỉ phần base64 thuần (bỏ tiền tố "data:image/...;base64,") */
  item.querySelector('.btn-copy-b64').addEventListener('click', () => {
    const full   = item.querySelector('.result-box').dataset.full;
    const base64 = full.split(',')[1] || full;
    navigator.clipboard.writeText(base64).then(() => showToast('Base64 copied!'));
  });

  /* Copy toàn bộ data URL (dùng được trực tiếp trong <img src="..."> hay CSS) */
  item.querySelector('.btn-copy-url').addEventListener('click', () => {
    const full = item.querySelector('.result-box').dataset.full;
    navigator.clipboard.writeText(full).then(() => showToast('Data URL copied!'));
  });

  /* Xóa card khỏi danh sách */
  item.querySelector('.btn-remove').addEventListener('click', () => item.remove());

  /* Thêm vào đầu (ảnh mới nhất hiển thị trên cùng) */
  document.getElementById('ib-results').prepend(item);
}


/* ─── Security helpers ──────────────────────────────────────────
   Escape ký tự HTML đặc biệt trước khi render vào innerHTML.
   Ngăn XSS nếu tên file người dùng chứa thẻ HTML độc hại.
─────────────────────────────────────────────────────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape dấu nháy kép cho giá trị attribute HTML */
function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}