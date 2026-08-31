/* ═══════════════════════════════════════════════════════════════
   app.js — DevTools
   Cấu trúc:
     1. Theme     — dark/light, lưu localStorage, áp dụng trước render
     2. Navigation — chuyển section trong sidebar
     3. Toast      — thông báo ngắn tự ẩn
     4. String Length  — đếm ký tự theo thời gian thực
     5. Image to Base64 — chuyển ảnh sang base64 / data URL
     6. Text Compare   — so sánh hai đoạn văn bản theo từng dòng
     7. Markdown Reader — đọc và render file Markdown
     8. Settings       — quản lý localStorage của tool
     9. Case Converter   — chuyển đổi text sang nhiều định dạng case
    10. Encode / Decode  — Unicode + hash (MD5 / SHA*)
═══════════════════════════════════════════════════════════════ */


/* ─── 1. THEME ──────────────────────────────────────────────────
   Áp dụng class 'light' lên <body> ngay khi script load (trước
   khi trình duyệt vẽ trang) để tránh flash màu sai.
─────────────────────────────────────────────────────────────── */
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') document.body.classList.add('light');
/* Sidebar: mặc định show; ẩn sớm để tránh nháy layout */
if (localStorage.getItem('sidebar') === 'hide') document.body.classList.add('sidebar-hidden');

/** Cập nhật icon và label của nút toggle theo chế độ hiện tại */
function applyThemeIcons(mode) {
  const isLight = mode === 'light';
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon)  icon.textContent  = isLight ? '🌙' : '☀️';
  if (label) label.textContent = isLight ? 'Dark mode' : 'Light mode';
}

/** Áp dụng theme dark|light, lưu localStorage, đồng bộ sidebar + Settings */
function applyTheme(mode) {
  const isLight = mode === 'light';
  document.body.classList.toggle('light', isLight);
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  applyThemeIcons(isLight ? 'light' : 'dark');
  document.querySelectorAll('.settings-theme').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.settingsTheme === (isLight ? 'light' : 'dark'));
  });
}

/** Áp dụng sidebar show|hide, lưu localStorage, đồng bộ nút + Settings */
function applySidebar(mode) {
  const hide = mode === 'hide';
  document.body.classList.toggle('sidebar-hidden', hide);
  localStorage.setItem('sidebar', hide ? 'hide' : 'show');
  const showBtn = document.getElementById('sidebar-show');
  if (showBtn) showBtn.hidden = !hide;
  document.querySelectorAll('.settings-sidebar').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.settingsSidebar === (hide ? 'hide' : 'show'));
  });
}

document.addEventListener('DOMContentLoaded', () => {

  /* Đồng bộ icon với trạng thái đã được áp dụng ở trên */
  applyThemeIcons(document.body.classList.contains('light') ? 'light' : 'dark');
  applySidebar(document.body.classList.contains('sidebar-hidden') ? 'hide' : 'show');

  document.getElementById('theme-toggle').addEventListener('click', () => {
    applyTheme(document.body.classList.contains('light') ? 'dark' : 'light');
  });

  document.getElementById('sidebar-hide').addEventListener('click', () => applySidebar('hide'));
  document.getElementById('sidebar-show').addEventListener('click', () => applySidebar('show'));


  /* ─── 2. NAVIGATION ──────────────────────────────────────────
     Khi click nav item:
       - Cập nhật class 'active' trên các button sidebar
       - Ẩn section đang hiển thị, hiện section tương ứng
     Liên kết giữa button và section qua attribute data-page
     và id của section (id = "page-" + data-page).
  ─────────────────────────────────────────────────────────────── */
  const navItems = document.querySelectorAll('.nav-item');
  const defaultPage = 'markdown-reader';

  const setActivePage = target => {
    const activeBtn = document.querySelector(`.nav-item[data-page="${target}"]`);
    const activePage = document.getElementById('page-' + target);
    if (!activeBtn || !activePage) return;

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    activePage.classList.add('active');
  };

  const updateToolParam = target => {
    const url = new URL(window.location.href);
    url.searchParams.set('tool', target);
    window.history.replaceState(null, '', url);
  };

  const requestedPage = new URLSearchParams(window.location.search).get('tool') || defaultPage;
  setActivePage(document.getElementById('page-' + requestedPage) ? requestedPage : defaultPage);

  navItems.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.page;
      setActivePage(target);
      updateToolParam(target);
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
    copyToClipboard(len, `Copied: ${len} characters`);
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


  /* ─── 6. TEXT COMPARE ───────────────────────────────────────
     So sánh hai đoạn văn bản theo từng dòng (line-by-line).
     Dùng thuật toán LCS để tìm các dòng giống/khác, sau đó
     render kết quả side-by-side với màu highlight.
  ─────────────────────────────────────────────────────────────── */
  document.getElementById('tc-compare').addEventListener('click', () => {
    const leftText  = document.getElementById('tc-left').value;
    const rightText = document.getElementById('tc-right').value;
    const diffs = diffLines(leftText.split('\n'), rightText.split('\n'));
    renderDiff(diffs);
    /* Sau khi render, scroll đến vùng kết quả để không phải cuộn thủ công */
    document.getElementById('tc-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* Xóa cả hai textarea và ẩn kết quả */
  document.getElementById('tc-clear').addEventListener('click', () => {
    document.getElementById('tc-left').value  = '';
    document.getElementById('tc-right').value = '';
    document.getElementById('tc-result-view').innerHTML = '';
    document.getElementById('tc-result').hidden = true;
  });


  /* ─── 7. MARKDOWN READER ───────────────────────────────────────
     Render Markdown sang HTML dùng marked.js (đã load qua CDN).
     Hỗ trợ upload file .md hoặc paste nội dung trực tiếp.
     Hai chế độ xem: side-by-side (split) và below.
  ─────────────────────────────────────────────────────────────────── */
  const mrInput     = document.getElementById('mr-input');
  const mrPreview   = document.getElementById('mr-preview');
  const mrContainer = document.getElementById('mr-container');
  const mrPage      = document.getElementById('page-markdown-reader');
  const mrEditorPanel  = mrContainer.querySelector('.mr-editor-panel');
  const mrPreviewPanel = mrContainer.querySelector('.mr-preview-panel');
  const mrSplitDivider = document.getElementById('mr-split-divider');
  const mrEditorToggle = document.getElementById('mr-editor-toggle');
  const mrMemoryToggle = document.getElementById('mr-memory-toggle');
  const mrMemoryClear  = document.getElementById('mr-memory-clear');
  const mrSyncToggle   = document.getElementById('mr-sync-toggle');
  const mrFocusToggle  = document.getElementById('mr-focus-toggle');

  const MR_STORAGE_PREFIX = 'devtools:markdown-reader:';
  const MR_MEMORY_MODE_KEY = MR_STORAGE_PREFIX + 'memory-mode';
  const MR_MEMORY_COUNT_KEY = MR_STORAGE_PREFIX + 'memory-chunk-count';
  const MR_MEMORY_CHUNK_PREFIX = MR_STORAGE_PREFIX + 'memory-content:';
  const MR_VIEW_MODE_KEY = MR_STORAGE_PREFIX + 'view-mode';
  const MR_SYNC_SCROLL_KEY = MR_STORAGE_PREFIX + 'sync-scroll';
  const MR_FOCUS_MODE_KEY = MR_STORAGE_PREFIX + 'focus-mode';
  const MR_MEMORY_CHUNK_SIZE = 200000;
  let mrMemoryEnabled = localStorage.getItem(MR_MEMORY_MODE_KEY) === 'true';
  /* Mặc định bật Sync scroll khi chưa có key */
  let mrSyncScrollEnabled = localStorage.getItem(MR_SYNC_SCROLL_KEY) !== 'false';
  /* Mặc định tắt Focus khi chưa có key */
  let mrFocusEnabled = localStorage.getItem(MR_FOCUS_MODE_KEY) === 'true';
  let mrSyncScrollLock = false;

  /* Render nội dung markdown hiện tại vào ô preview */
  const mrRender = () => {
    const md = mrInput.value;
    if (!md.trim()) {
      mrPreview.innerHTML = '<p class="mr-empty">Preview will appear here.</p>';
      return;
    }
    mrPreview.innerHTML = marked.parse(md);
  };

  const mrForEachMemoryKey = callback => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(MR_MEMORY_CHUNK_PREFIX)) keys.push(key);
    }
    keys.forEach(callback);
  };

  const mrClearMemoryContent = () => {
    mrForEachMemoryKey(key => localStorage.removeItem(key));
    localStorage.removeItem(MR_MEMORY_COUNT_KEY);
  };

  const mrReadMemoryContent = () => {
    const count = Number(localStorage.getItem(MR_MEMORY_COUNT_KEY) || 0);
    if (!Number.isInteger(count) || count <= 0) return '';

    let content = '';
    for (let i = 0; i < count; i++) {
      content += localStorage.getItem(MR_MEMORY_CHUNK_PREFIX + i) || '';
    }
    return content;
  };

  const mrSaveMemoryContent = content => {
    if (!mrMemoryEnabled) return;

    try {
      mrClearMemoryContent();
      if (!content) return;

      const count = Math.ceil(content.length / MR_MEMORY_CHUNK_SIZE);
      for (let i = 0; i < count; i++) {
        const start = i * MR_MEMORY_CHUNK_SIZE;
        localStorage.setItem(
          MR_MEMORY_CHUNK_PREFIX + i,
          content.slice(start, start + MR_MEMORY_CHUNK_SIZE)
        );
      }
      localStorage.setItem(MR_MEMORY_COUNT_KEY, String(count));
    } catch (_) {
      mrClearMemoryContent();
      showToast('Markdown memory is full. Content was not saved.');
    }
  };

  const mrApplyMemoryControls = () => {
    mrMemoryToggle.textContent = mrMemoryEnabled ? 'Memory: On' : 'Memory: Off';
    mrMemoryToggle.classList.toggle('active', mrMemoryEnabled);
    mrMemoryClear.hidden = !mrMemoryEnabled;
  };

  /* Đồng bộ nhãn / active của nút Sync scroll */
  const mrApplySyncControls = () => {
    mrSyncToggle.textContent = mrSyncScrollEnabled ? 'Sync scroll: On' : 'Sync scroll: Off';
    mrSyncToggle.classList.toggle('active', mrSyncScrollEnabled);
  };

  /* Focus: ẩn page-header ở cả Side by side và Below */
  const mrApplyFocusControls = () => {
    mrFocusToggle.textContent = mrFocusEnabled ? 'Focus: On' : 'Focus: Off';
    mrFocusToggle.classList.toggle('active', mrFocusEnabled);
    mrPage.classList.toggle('mr-focus', mrFocusEnabled);
  };

  /* Đồng bộ chevron + aria theo trạng thái thu gọn editor (chỉ dùng ở below) */
  const mrApplyEditorCollapsed = () => {
    const collapsed = mrContainer.classList.contains('mr-editor-collapsed');
    const chevron = mrEditorToggle.querySelector('.mr-editor-chevron');
    mrEditorToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    mrEditorToggle.title = collapsed ? 'Expand editor' : 'Collapse editor';
    if (chevron) chevron.textContent = collapsed ? '▸' : '▾';
  };

  const mrResizeEditor = () => {
    if (!mrContainer.classList.contains('mr-below') || mrContainer.classList.contains('mr-editor-collapsed')) {
      mrInput.style.height = '';
      return;
    }
    mrInput.style.height = 'auto';
    mrInput.style.height = (mrInput.scrollHeight + 2) + 'px';
  };

  /* Đưa tỷ lệ split về 50/50 (không lưu localStorage) */
  const mrResetSplitWidths = () => {
    if (mrEditorPanel) mrEditorPanel.style.flex = '';
    if (mrPreviewPanel) mrPreviewPanel.style.flex = '';
  };

  /* Áp dụng chế độ xem split|below, đồng bộ nút toggle; below mặc định thu gọn editor */
  const mrApplyView = view => {
    const mode = view === 'below' ? 'below' : 'split';
    document.querySelectorAll('.mr-toggle').forEach(b => {
      b.classList.toggle('active', b.dataset.view === mode);
    });
    mrContainer.className = 'mr-container mr-' + mode + (mode === 'below' ? ' mr-editor-collapsed' : '');
    mrSyncToggle.hidden = mode === 'below'; /* Sync scroll chỉ dùng ở Side by side */
    if (mode === 'below') mrResetSplitWidths();
    mrApplyFocusControls();
    mrApplyEditorCollapsed();
    mrResizeEditor();
  };

  /* Đồng bộ scroll theo tỷ lệ — chỉ khi Sync bật và đang ở split */
  const mrSyncScrollFrom = (source, target) => {
    if (!mrSyncScrollEnabled || mrSyncScrollLock) return;
    if (!mrContainer.classList.contains('mr-split')) return;

    const sourceMax = source.scrollHeight - source.clientHeight;
    const targetMax = target.scrollHeight - target.clientHeight;
    if (sourceMax <= 0 || targetMax <= 0) return;

    mrSyncScrollLock = true;
    target.scrollTop = (source.scrollTop / sourceMax) * targetMax;
    requestAnimationFrame(() => { mrSyncScrollLock = false; });
  };

  const mrHandleInput = () => {
    mrRender();
    mrResizeEditor();
    mrSaveMemoryContent(mrInput.value);
  };

  const mrClearEditor = () => {
    mrInput.value = '';
    mrInput.dispatchEvent(new Event('input'));
  };

  if (mrMemoryEnabled) {
    mrInput.value = mrReadMemoryContent();
  } else {
    mrClearMemoryContent();
  }
  mrApplyMemoryControls();
  mrApplySyncControls();
  mrApplyView(localStorage.getItem(MR_VIEW_MODE_KEY));
  mrRender();
  mrResizeEditor();

  /* Cập nhật preview mỗi khi người dùng gõ / paste */
  mrInput.addEventListener('input', mrHandleInput);

  /* Sync scroll: editor ↔ preview (chỉ khi bật và ở split) */
  mrInput.addEventListener('scroll', () => mrSyncScrollFrom(mrInput, mrPreview));
  mrPreview.addEventListener('scroll', () => mrSyncScrollFrom(mrPreview, mrInput));

  /* Kéo thanh giữa để đổi độ rộng editor / preview (chỉ split; không lưu) */
  if (mrSplitDivider && mrEditorPanel && mrPreviewPanel) {
    let mrSplitDragging = false;

    const mrApplySplitRatio = clientX => {
      const rect = mrContainer.getBoundingClientRect();
      const dividerW = mrSplitDivider.offsetWidth;
      const avail = rect.width - dividerW;
      if (avail <= 0) return;
      const minPx = 140;
      const leftPx = Math.min(Math.max(clientX - rect.left, minPx), avail - minPx);
      const leftPct = (leftPx / avail) * 100;
      mrEditorPanel.style.flex = `0 0 ${leftPct}%`;
      mrPreviewPanel.style.flex = '1 1 0';
    };

    mrSplitDivider.addEventListener('mousedown', e => {
      if (!mrContainer.classList.contains('mr-split')) return;
      e.preventDefault();
      mrSplitDragging = true;
      document.body.classList.add('mr-splitting');
    });

    document.addEventListener('mousemove', e => {
      if (!mrSplitDragging) return;
      mrApplySplitRatio(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      if (!mrSplitDragging) return;
      mrSplitDragging = false;
      document.body.classList.remove('mr-splitting');
    });
  }

  /* Chèn ký tự tab khi nhấn Tab thay vì chuyển focus ra ngoài.
     Dùng dispatchEvent('input') để mọi listener (mrRender, v.v.) chạy
     qua đúng kênh event thay vì gọi trực tiếp. */
  mrInput.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = mrInput.selectionStart;
      const end   = mrInput.selectionEnd;
      mrInput.setRangeText('    ', start, end, 'end');
      mrInput.dispatchEvent(new Event('input'));
    }
  });

  /* Mở file picker khi nhấn nút load */
  document.getElementById('mr-file-btn').addEventListener('click', () => {
    document.getElementById('mr-file-input').click();
  });

  /* Đọc file .md và điền vào textarea, sau đó render ngay */
  document.getElementById('mr-file-input').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      mrInput.value = e.target.result;
      mrInput.dispatchEvent(new Event('input'));
      this.value = ''; // reset để có thể chọn lại cùng file
    };
    reader.readAsText(file, 'UTF-8');
  });

  mrMemoryToggle.addEventListener('click', () => {
    mrMemoryEnabled = !mrMemoryEnabled;
    localStorage.setItem(MR_MEMORY_MODE_KEY, mrMemoryEnabled ? 'true' : 'false');

    if (mrMemoryEnabled) {
      mrSaveMemoryContent(mrInput.value);
      showToast('Markdown memory enabled.');
    } else {
      mrClearMemoryContent();
      showToast('Markdown memory cleared.');
    }
    mrApplyMemoryControls();
  });

  mrMemoryClear.addEventListener('click', () => {
    mrClearMemoryContent();
    mrClearEditor();
    showToast('Markdown memory cleared.');
  });

  /* Bật / tắt Sync scroll — lưu localStorage */
  mrSyncToggle.addEventListener('click', () => {
    mrSyncScrollEnabled = !mrSyncScrollEnabled;
    localStorage.setItem(MR_SYNC_SCROLL_KEY, mrSyncScrollEnabled ? 'true' : 'false');
    mrApplySyncControls();
  });

  /* Bật / tắt Focus (ẩn header) — lưu localStorage; dùng cho cả split và below */
  mrFocusToggle.addEventListener('click', () => {
    mrFocusEnabled = !mrFocusEnabled;
    localStorage.setItem(MR_FOCUS_MODE_KEY, mrFocusEnabled ? 'true' : 'false');
    mrApplyFocusControls();
  });

  /* Thu gọn / mở editor — chỉ có hiệu lực ở chế độ below */
  mrEditorToggle.addEventListener('click', () => {
    if (!mrContainer.classList.contains('mr-below')) return;
    mrContainer.classList.toggle('mr-editor-collapsed');
    mrApplyEditorCollapsed();
    mrResizeEditor();
  });

  /* Chuyển chế độ xem: split ↔ below — lưu lựa chọn vào localStorage */
  document.querySelectorAll('.mr-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      localStorage.setItem(MR_VIEW_MODE_KEY, view);
      mrApplyView(view);
    });
  });

  /* Xóa nội dung và reset preview */
  document.getElementById('mr-clear').addEventListener('click', () => {
    mrClearEditor();
  });

  /* Xuất preview ra PDF qua hộp thoại in của trình duyệt */
  document.getElementById('mr-export-pdf').addEventListener('click', () => {
    window.print();
  });

  /* Tải nội dung editor về dưới dạng file .md */
  document.getElementById('mr-download').addEventListener('click', () => {
    const content = mrInput.value;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
  });


  /* ─── ENCODE / DECODE ──────────────────────────────────────────
     Unicode escape + hash (MD5/SHA* qua crypto-js).
     Chế độ Encode|Decode (mặc định Encode); Result cập nhật live theo Input.
  ─────────────────────────────────────────────────────────────────── */
  const edPage     = document.getElementById('page-encode-decode');
  const edInput    = document.getElementById('ed-input');
  const edResult   = document.getElementById('ed-result');
  const edCodec    = document.getElementById('ed-codec');
  const edEncodeBtn = document.getElementById('ed-encode');
  const edDecodeBtn = document.getElementById('ed-decode');
  const edFocusToggle = document.getElementById('ed-focus-toggle');
  const settingsEdCodec = document.getElementById('settings-ed-codec');
  const settingsEdModeBtns = document.querySelectorAll('.settings-ed-mode');
  const settingsEdFocusBtns = document.querySelectorAll('.settings-ed-focus');

  const ED_STORAGE_PREFIX = 'devtools:encode-decode:';
  const ED_CODEC_KEY = ED_STORAGE_PREFIX + 'codec';
  const ED_MODE_KEY = ED_STORAGE_PREFIX + 'mode';
  const ED_FOCUS_MODE_KEY = ED_STORAGE_PREFIX + 'focus-mode';
  const ED_CODEC_IDS = ['unicode', 'md5', 'sha1', 'sha3-256', 'sha3-512', 'sha256', 'sha512'];

  const edNormalizeCodec = value => {
    if (value === 'sha3') return 'sha3-256'; /* migrate key cũ */
    return ED_CODEC_IDS.includes(value) ? value : 'unicode';
  };
  /* Mặc định encode khi chưa có key */
  let edMode = localStorage.getItem(ED_MODE_KEY) === 'decode' ? 'decode' : 'encode';
  let edFocusEnabled = localStorage.getItem(ED_FOCUS_MODE_KEY) === 'true';

  /* Unicode → \uXXXX (BMP / surrogate pair) */
  const edUnicodeEncode = str =>
    Array.from(str).map(ch => {
      const cp = ch.codePointAt(0);
      if (cp > 0xffff) {
        const h = Math.floor((cp - 0x10000) / 0x400) + 0xd800;
        const l = ((cp - 0x10000) % 0x400) + 0xdc00;
        return '\\u' + h.toString(16).padStart(4, '0') + '\\u' + l.toString(16).padStart(4, '0');
      }
      return '\\u' + cp.toString(16).padStart(4, '0');
    }).join('');

  /* \uXXXX / \u{...} → text */
  const edUnicodeDecode = str => {
    try {
      return str.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_, brace, quad) => {
        const hex = brace || quad;
        return String.fromCodePoint(parseInt(hex, 16));
      });
    } catch (_) {
      return null;
    }
  };

  const edHashHex = (algo, text) => {
    if (typeof CryptoJS === 'undefined') {
      showToast('Crypto library failed to load.');
      return null;
    }
    switch (algo) {
      case 'md5':    return CryptoJS.MD5(text).toString();
      case 'sha1':   return CryptoJS.SHA1(text).toString();
      case 'sha256': return CryptoJS.SHA256(text).toString();
      case 'sha512': return CryptoJS.SHA512(text).toString();
      case 'sha3-256': return CryptoJS.SHA3(text, { outputLength: 256 }).toString();
      case 'sha3-512': return CryptoJS.SHA3(text, { outputLength: 512 }).toString();
      default:       return null;
    }
  };

  const ED_MAX_BYTES = 256 * 1024; /* 256 KB (UTF-8) */
  const ED_DEBOUNCE_MS = 150;
  const edTextEncoder = new TextEncoder();
  let edConvertTimer = null;
  let edLimitToastAt = 0;

  const edByteLength = str => edTextEncoder.encode(str).length;

  /* Cắt chuỗi theo giới hạn UTF-8 bytes (binary search) */
  const edClampToMaxBytes = str => {
    if (edByteLength(str) <= ED_MAX_BYTES) return str;
    let lo = 0;
    let hi = str.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (edByteLength(str.slice(0, mid)) <= ED_MAX_BYTES) lo = mid;
      else hi = mid - 1;
    }
    return str.slice(0, lo);
  };

  const edEnforceInputLimit = () => {
    const raw = edInput.value;
    if (edByteLength(raw) <= ED_MAX_BYTES) return false;
    const start = edInput.selectionStart;
    const end = edInput.selectionEnd;
    edInput.value = edClampToMaxBytes(raw);
    const pos = Math.min(edInput.value.length, start, end);
    edInput.setSelectionRange(pos, pos);
    const now = Date.now();
    if (now - edLimitToastAt > 2000) {
      edLimitToastAt = now;
      showToast('Input limited to 256 KB.');
    }
    return true;
  };

  const edGetCodec = () => edNormalizeCodec(edCodec.value);

  /* Cập nhật Result ngay (đổi mode/codec / init) */
  const edConvertNow = () => {
    const text = edInput.value;
    if (!text) {
      edResult.value = '';
      return;
    }
    const codec = edGetCodec();
    if (edMode === 'decode') {
      if (codec !== 'unicode') {
        edResult.value = '';
        return;
      }
      const out = edUnicodeDecode(text);
      edResult.value = out == null ? '' : out;
      return;
    }
    if (codec === 'unicode') {
      edResult.value = edUnicodeEncode(text);
      return;
    }
    const hex = edHashHex(codec, text);
    if (hex != null) edResult.value = hex;
  };

  /* Debounce khi gõ / paste — giảm nghẽn UI */
  const edScheduleConvert = () => {
    clearTimeout(edConvertTimer);
    edConvertTimer = setTimeout(edConvertNow, ED_DEBOUNCE_MS);
  };

  const edApplyModeControls = () => {
    edEncodeBtn.classList.toggle('active', edMode === 'encode');
    edDecodeBtn.classList.toggle('active', edMode === 'decode');
    settingsEdModeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.settingsEdMode === edMode);
    });
  };

  const edApplyCodecUI = codec => {
    const id = edNormalizeCodec(codec);
    edCodec.value = id;
    if (settingsEdCodec) settingsEdCodec.value = id;
    /* Hash một chiều — Decode chỉ hữu ích với Unicode */
    edDecodeBtn.disabled = id !== 'unicode';
    settingsEdModeBtns.forEach(btn => {
      if (btn.dataset.settingsEdMode === 'decode') btn.disabled = id !== 'unicode';
    });
  };

  const edApplyFocusControls = () => {
    edFocusToggle.textContent = edFocusEnabled ? 'Focus: On' : 'Focus: Off';
    edFocusToggle.classList.toggle('active', edFocusEnabled);
    edPage.classList.toggle('ed-focus', edFocusEnabled);
  };

  const edSetMode = mode => {
    const next = mode === 'decode' ? 'decode' : 'encode';
    if (next === 'decode' && edGetCodec() !== 'unicode') {
      showToast('This algorithm is one-way and cannot be decoded.');
      return;
    }
    edMode = next;
    localStorage.setItem(ED_MODE_KEY, edMode);
    edApplyModeControls();
    edConvertNow(); /* Đổi chế độ: giữ nội dung, chỉ tính lại Result */
  };

  const edSetCodec = codec => {
    const id = edNormalizeCodec(codec);
    localStorage.setItem(ED_CODEC_KEY, id);
    edApplyCodecUI(id);
    /* Hash không decode được — về Encode nếu đang Decode */
    if (id !== 'unicode' && edMode === 'decode') {
      edMode = 'encode';
      localStorage.setItem(ED_MODE_KEY, 'encode');
      edApplyModeControls();
    }
    edConvertNow();
  };

  edApplyCodecUI(localStorage.getItem(ED_CODEC_KEY));
  /* Hash + mode decode đã lưu → về encode */
  if (edGetCodec() !== 'unicode' && edMode === 'decode') {
    edMode = 'encode';
    localStorage.setItem(ED_MODE_KEY, 'encode');
  }
  edApplyModeControls();
  edApplyFocusControls();
  edConvertNow();

  edCodec.addEventListener('change', () => edSetCodec(edCodec.value));
  edInput.addEventListener('input', () => {
    edEnforceInputLimit();
    edScheduleConvert();
  });

  edEncodeBtn.addEventListener('click', () => edSetMode('encode'));
  edDecodeBtn.addEventListener('click', () => edSetMode('decode'));

  document.getElementById('ed-copy').addEventListener('click', () => {
    if (!edResult.value) return;
    copyToClipboard(edResult.value, 'Copied!');
  });

  document.getElementById('ed-clear').addEventListener('click', () => {
    edInput.value = '';
    edResult.value = '';
  });

  /* Swap nội dung + đảo chế độ Encode↔Decode (đồng bộ như Google Translate) */
  document.getElementById('ed-swap').addEventListener('click', () => {
    const a = edInput.value;
    edInput.value = edResult.value;
    edResult.value = a;
    edEnforceInputLimit(); /* Result Unicode có thể > 256 KB */
    const next = edMode === 'encode' ? 'decode' : 'encode';
    /* Hash một chiều: chỉ swap nội dung, giữ Encode */
    if (next === 'decode' && edGetCodec() !== 'unicode') return;
    edSetMode(next); /* đổi mode + convert lại (Unicode: Result khớp phía vừa swap) */
  });

  edFocusToggle.addEventListener('click', () => {
    edFocusEnabled = !edFocusEnabled;
    localStorage.setItem(ED_FOCUS_MODE_KEY, edFocusEnabled ? 'true' : 'false');
    edApplyFocusControls();
  });

  /* ─── SETTINGS ─────────────────────────────────────────────────
     Quản lý localStorage: Theme + Sidebar + Markdown Reader + Encode/Decode.
  ─────────────────────────────────────────────────────────────────── */
  const settingsMrViewBtns = document.querySelectorAll('.settings-mr-view');
  const settingsMrSyncBtns = document.querySelectorAll('.settings-mr-sync');
  const settingsMrFocusBtns = document.querySelectorAll('.settings-mr-focus');
  const settingsMrMemoryBtns = document.querySelectorAll('.settings-mr-memory');
  const settingsMrMemoryClear  = document.getElementById('settings-mr-memory-clear');
  const settingsThemeBtns = document.querySelectorAll('.settings-theme');
  const settingsSidebarBtns = document.querySelectorAll('.settings-sidebar');

  /* Đồng bộ UI Settings với giá trị đang lưu */
  const refreshSettingsUI = () => {
    const theme = document.body.classList.contains('light') ? 'light' : 'dark';
    settingsThemeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.settingsTheme === theme);
    });

    const sidebar = document.body.classList.contains('sidebar-hidden') ? 'hide' : 'show';
    settingsSidebarBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.settingsSidebar === sidebar);
    });

    const view = localStorage.getItem(MR_VIEW_MODE_KEY) === 'below' ? 'below' : 'split';
    settingsMrViewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.settingsMrView === view);
    });

    const syncOn = localStorage.getItem(MR_SYNC_SCROLL_KEY) !== 'false';
    settingsMrSyncBtns.forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.settingsMrSync === 'on') === syncOn);
    });

    const focusOn = localStorage.getItem(MR_FOCUS_MODE_KEY) === 'true';
    settingsMrFocusBtns.forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.settingsMrFocus === 'on') === focusOn);
    });

    const memOn = localStorage.getItem(MR_MEMORY_MODE_KEY) === 'true';
    settingsMrMemoryBtns.forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.settingsMrMemory === 'on') === memOn);
    });
    settingsMrMemoryClear.disabled = !memOn;

    if (settingsEdCodec) settingsEdCodec.value = edNormalizeCodec(localStorage.getItem(ED_CODEC_KEY));
    const edModeSaved = localStorage.getItem(ED_MODE_KEY) === 'decode' ? 'decode' : 'encode';
    settingsEdModeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.settingsEdMode === edModeSaved);
      if (btn.dataset.settingsEdMode === 'decode') {
        btn.disabled = edNormalizeCodec(localStorage.getItem(ED_CODEC_KEY)) !== 'unicode';
      }
    });
    const edFocusOn = localStorage.getItem(ED_FOCUS_MODE_KEY) === 'true';
    settingsEdFocusBtns.forEach(btn => {
      btn.classList.toggle('active', (btn.dataset.settingsEdFocus === 'on') === edFocusOn);
    });
  };

  /* Xóa toàn bộ key localStorage của Markdown Reader → về mặc định */
  const resetMarkdownReaderSettings = () => {
    localStorage.removeItem(MR_VIEW_MODE_KEY);
    localStorage.removeItem(MR_SYNC_SCROLL_KEY);
    localStorage.removeItem(MR_FOCUS_MODE_KEY);
    localStorage.removeItem(MR_MEMORY_MODE_KEY);
    mrClearMemoryContent();
  };

  const resetEncodeDecodeSettings = () => {
    localStorage.removeItem(ED_CODEC_KEY);
    localStorage.removeItem(ED_MODE_KEY);
    localStorage.removeItem(ED_FOCUS_MODE_KEY);
  };

  settingsThemeBtns.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.dataset.settingsTheme));
  });

  settingsSidebarBtns.forEach(btn => {
    btn.addEventListener('click', () => applySidebar(btn.dataset.settingsSidebar));
  });

  settingsMrViewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.settingsMrView;
      localStorage.setItem(MR_VIEW_MODE_KEY, view);
      mrApplyView(view);
      refreshSettingsUI();
    });
  });

  /* Sync scroll On/Off — gọi cùng kênh với nút toolbar */
  settingsMrSyncBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wantOn = btn.dataset.settingsMrSync === 'on';
      if (mrSyncScrollEnabled === wantOn) return;
      mrSyncToggle.click();
      refreshSettingsUI();
    });
  });

  /* Focus On/Off — gọi cùng kênh với nút toolbar */
  settingsMrFocusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wantOn = btn.dataset.settingsMrFocus === 'on';
      if (mrFocusEnabled === wantOn) return;
      mrFocusToggle.click();
      refreshSettingsUI();
    });
  });

  /* On/Off — chỉ gọi toggle MR khi trạng thái thực sự đổi */
  settingsMrMemoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wantOn = btn.dataset.settingsMrMemory === 'on';
      if (mrMemoryEnabled === wantOn) return;
      mrMemoryToggle.click();
      refreshSettingsUI();
    });
  });

  settingsMrMemoryClear.addEventListener('click', () => {
    mrMemoryClear.click();
    refreshSettingsUI();
  });

  if (settingsEdCodec) {
    settingsEdCodec.addEventListener('change', () => {
      edSetCodec(settingsEdCodec.value);
      refreshSettingsUI();
    });
  }

  settingsEdModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const want = btn.dataset.settingsEdMode === 'decode' ? 'decode' : 'encode';
      if (edMode === want) return;
      edSetMode(want);
      refreshSettingsUI();
    });
  });

  settingsEdFocusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wantOn = btn.dataset.settingsEdFocus === 'on';
      if (edFocusEnabled === wantOn) return;
      edFocusToggle.click();
      refreshSettingsUI();
    });
  });

  document.getElementById('settings-reset-all').addEventListener('click', () => {
    if (!confirm('Reset all settings to defaults?')) return;
    resetMarkdownReaderSettings();
    resetEncodeDecodeSettings();
    localStorage.removeItem('theme'); // mặc định: dark
    localStorage.removeItem('sidebar'); // mặc định: show
    location.reload();
  });

  document.querySelector('.nav-item[data-page="settings"]').addEventListener('click', refreshSettingsUI);
  refreshSettingsUI();


  /* ─── 9. CASE CONVERTER ────────────────────────────────────────
     Chuyển đổi text sang các định dạng case: camelCase, snake_case, v.v.
     Xử lý từng dòng độc lập. Không cần thư viện ngoài.
  ─────────────────────────────────────────────────────────────────── */
  const ccInput  = document.getElementById('cc-input');
  const ccOutput = document.getElementById('cc-output');

  /* Tách cỗi thành mảng từ — hiểu camelCase, PascalCase, snake_case, kebab-case, v.v. */
  const ccSplitWords = str =>
    str
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  /* Capitalize một từ */
  const ccCap = w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();

  /* Bảng ánh xạ tên case → hàm chuyển đổi */
  const ccConverters = {
    'lowercase':         str => str.toLowerCase(),
    'UPPERCASE':         str => str.toUpperCase(),
    'camelCase':         str => { const w = ccSplitWords(str); return w.length ? w[0].toLowerCase() + w.slice(1).map(ccCap).join('') : ''; },
    'Capital Case':      str => ccSplitWords(str).map(ccCap).join(' '),
    'CONSTANT_CASE':     str => ccSplitWords(str).join('_').toUpperCase(),
    'dot.case':          str => ccSplitWords(str).join('.').toLowerCase(),
    'kebab-case':        str => ccSplitWords(str).join('-').toLowerCase(),
    'no case':           str => ccSplitWords(str).join(' ').toLowerCase(),
    'PascalCase':        str => ccSplitWords(str).map(ccCap).join(''),
    'Pascal_Snake_Case': str => ccSplitWords(str).map(ccCap).join('_'),
    'path/case':         str => ccSplitWords(str).join('/').toLowerCase(),
    'Sentence case':     str => { const w = ccSplitWords(str); return w.length ? ccCap(w[0]) + (w.length > 1 ? ' ' + w.slice(1).map(s => s.toLowerCase()).join(' ') : '') : ''; },
    'snake_case':        str => ccSplitWords(str).join('_').toLowerCase(),
    'sWAP cASE':         str => str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
    'Train-Case':        str => ccSplitWords(str).map(ccCap).join('-'),
  };

  /* Áp dụng conversion — mỗi dòng được xử lý độc lập */
  const ccConvert = caseName => {
    const fn = ccConverters[caseName];
    if (!fn) return;
    ccOutput.value = ccInput.value.split('\n').map(fn).join('\n');
  };

  /* Gắn sự kiện cho tất cả nút case */
  document.querySelectorAll('.btn-case').forEach(btn => {
    btn.addEventListener('click', () => ccConvert(btn.dataset.case));
  });

  /* Clear: xóa cả input lẫn output */
  document.getElementById('cc-clear').addEventListener('click', () => {
    ccInput.value = '';
    ccOutput.value = '';
  });

  /* Copy output */
  document.getElementById('cc-copy').addEventListener('click', () => {
    if (!ccOutput.value) return;
    copyToClipboard(ccOutput.value, 'Copied!');
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

/** Fallback copy bằng execCommand cho môi trường không có Clipboard API (file://, HTTP) */
function execCopy(text) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.appendChild(el);
  el.select();
  try { document.execCommand('copy'); } catch (_) {}
  el.remove();
}

/** Copy text vào clipboard (hỗ trợ cả HTTPS lẫn HTTP/file://) và hiện toast */
function copyToClipboard(text, msg) {
  const done = () => showToast(msg || 'Copied!');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => { execCopy(text); done(); });
  } else {
    execCopy(text);
    done();
  }
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
    copyToClipboard(base64, 'Base64 copied!');
  });

  /* Copy toàn bộ data URL (dùng được trực tiếp trong <img src="..."> hay CSS) */
  item.querySelector('.btn-copy-url').addEventListener('click', () => {
    const full = item.querySelector('.result-box').dataset.full;
    copyToClipboard(full, 'Data URL copied!');
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


/* ─── TEXT COMPARE: helpers ─────────────────────────────────────
   Tách ra ngoài DOMContentLoaded để sẵn sàng cho mọi nơi gọi.
─────────────────────────────────────────────────────────────── */

/**
 * So sánh hai mảng dòng bằng LCS (Longest Common Subsequence).
 * Trả về mảng {type, left, right} với type:
 *   'equal'   — dòng giống nhau ở cả hai bên
 *   'removed' — chỉ có ở Text A (bên trái)
 *   'added'   — chỉ có ở Text B (bên phải)
 *   'changed' — cặp removed+added liên tiếp, gộp hiển thị cùng hàng
 */
function diffLines(a, b) {
  const m = a.length, n = b.length;

  /* Xây dựng bảng LCS kích thước (m+1) x (n+1) */
  const dp = [];
  for (let i = 0; i <= m; i++) dp.push(new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

  /* Truy vết ngược để lấy chuỗi thao tác diff */
  const raw = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) {
      raw.push({ type: 'equal',   left: a[i-1], right: b[j-1] }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      raw.push({ type: 'added',   left: null,   right: b[j-1] }); j--;
    } else {
      raw.push({ type: 'removed', left: a[i-1], right: null   }); i--;
    }
  }
  raw.reverse();

  /* Gộp cặp removed+added liên tiếp thành 'changed' (hiển thị cùng hàng) */
  const result = [];
  for (let k = 0; k < raw.length; k++) {
    if (raw[k].type === 'removed' && k + 1 < raw.length && raw[k+1].type === 'added') {
      result.push({ type: 'changed', left: raw[k].left, right: raw[k+1].right });
      k++; // bỏ qua phần tử tiếp theo đã được gộp
    } else {
      result.push(raw[k]);
    }
  }
  return result;
}

/**
 * So sánh hai chuỗi ký tự bằng LCS. Trả về mảng {type, text}
 * với type: 'equal' | 'removed' | 'added'.
 * Dùng để highlight khác biệt inline trong dòng 'changed'.
 */
function diffInline(a, b) {
  /* Giới hạn độ dài để tránh LCS chậm trên chuỗi rất dài */
  if (a.length + b.length > 1000) {
    return [{ type: 'removed', text: a }, { type: 'added', text: b }];
  }

  const m = a.length, n = b.length;
  const dp = [];
  for (let i = 0; i <= m; i++) dp.push(new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

  /* Truy vết ngược */
  const raw = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) {
      raw.push({ type: 'equal',   text: a[i-1] }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      raw.push({ type: 'added',   text: b[j-1] }); j--;
    } else {
      raw.push({ type: 'removed', text: a[i-1] }); i--;
    }
  }
  raw.reverse();

  /* Gộp các ký tự liên tiếp cùng type thành một phần tử */
  const result = [];
  raw.forEach(part => {
    if (result.length > 0 && result[result.length - 1].type === part.type) {
      result[result.length - 1].text += part.text;
    } else {
      result.push({ type: part.type, text: part.text });
    }
  });
  return result;
}

/**
 * Render kết quả diff vào #tc-result-view dạng side-by-side.
 * Mỗi hàng gồm hai ô: ô trái (Text A) và ô phải (Text B).
 */
function renderDiff(diffs) {
  const view    = document.getElementById('tc-result-view');
  const summary = document.getElementById('tc-summary');
  const result  = document.getElementById('tc-result');

  view.innerHTML = '';
  let leftNum = 0, rightNum = 0, diffCount = 0;

  diffs.forEach(d => {
    const row = document.createElement('div');
    row.className = 'tc-row';

    if (d.type === 'equal') {
      leftNum++; rightNum++;
      row.appendChild(makeCell('equal',   leftNum,  d.left));
      row.appendChild(makeCell('equal',   rightNum, d.right));
    } else if (d.type === 'removed') {
      leftNum++; diffCount++;
      row.appendChild(makeCell('removed', leftNum,  d.left));
      row.appendChild(makeCell('empty',   null,     null));
    } else if (d.type === 'added') {
      rightNum++; diffCount++;
      row.appendChild(makeCell('empty',   null,     null));
      row.appendChild(makeCell('added',   rightNum, d.right));
    } else { // changed
      leftNum++; rightNum++; diffCount++;
      row.appendChild(makeCell('removed', leftNum,  d.left,  d.right)); // pass counterpart để highlight inline
      row.appendChild(makeCell('added',   rightNum, d.right, d.left));  // pass counterpart để highlight inline
    }
    view.appendChild(row);
  });

  /* Hiển thị tóm tắt kết quả */
  if (diffCount === 0) {
    summary.textContent = '✓ The two texts are identical.';
    summary.className   = 'tc-summary tc-summary-ok';
  } else {
    summary.textContent = `${diffCount} line${diffCount > 1 ? 's' : ''} differ.`;
    summary.className   = 'tc-summary tc-summary-diff';
  }
  result.hidden = false;
}

/**
 * Tạo một ô trong hàng diff. type: 'equal' | 'removed' | 'added' | 'empty'
 * counterpart: chuỗi đối chiếu (chỉ truyền cho dòng 'changed' để highlight inline)
 */
function makeCell(type, num, text, counterpart) {
  const cell = document.createElement('div');
  cell.className = 'tc-cell tc-cell-' + type;
  if (type === 'empty') return cell;

  const numEl = document.createElement('span');
  numEl.className   = 'tc-num';
  numEl.textContent = num;

  const textEl = document.createElement('span');
  textEl.className = 'tc-text';

  /* Nếu có counterpart: dùng diffInline để highlight các ký tự khác biệt */
  if (counterpart !== undefined) {
    const parts = type === 'removed'
      ? diffInline(text, counterpart)
      : diffInline(counterpart, text);
    parts.forEach(part => {
      if (type === 'removed' && part.type === 'added')   return; // bỏ phần chỉ có bên phải
      if (type === 'added'   && part.type === 'removed') return; // bỏ phần chỉ có bên trái
      const span = document.createElement('span');
      span.textContent = part.text; // textContent is safe
      if (part.type !== 'equal') span.className = 'tc-inline-' + part.type;
      textEl.appendChild(span);
    });
  } else {
    textEl.textContent = text; // textContent is safe — no need for escapeHtml
  }

  cell.appendChild(numEl);
  cell.appendChild(textEl);
  return cell;
}
