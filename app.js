/* ── Theme toggle ───────────────────────────────────────────── */
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') applyTheme('light');
})();

function applyTheme(mode) {
  const isLight = mode === 'light';
  document.body.classList.toggle('light', isLight);
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon)  icon.textContent  = isLight ? '🌙' : '☀️';
  if (label) label.textContent = isLight ? 'Dark mode' : 'Light mode';
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  const mode = isLight ? 'light' : 'dark';
  localStorage.setItem('theme', mode);
  applyTheme(mode);
});

/* ── Navigation ─────────────────────────────────────────────── */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    // active nav
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // show page
    const target = btn.dataset.page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + target).classList.add('active');
  });
});

/* ── Toast ──────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ══════════════════════════════════════════════════════════════
   FEATURE 1 — String Length
══════════════════════════════════════════════════════════════ */
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

document.getElementById('sl-clear').addEventListener('click', () => {
  slInput.value = '';
  updateStats();
});

document.getElementById('sl-copy').addEventListener('click', () => {
  const len = slInput.value.length.toString();
  navigator.clipboard.writeText(len).then(() => {
    showToast(`Copied: ${len} characters`);
  });
});

/* ══════════════════════════════════════════════════════════════
   FEATURE 2 — Image to Base64
══════════════════════════════════════════════════════════════ */
const ibInput    = document.getElementById('ib-input');
const ibDropzone = document.getElementById('ib-dropzone');
const ibResults  = document.getElementById('ib-results');

// Click to open file picker
ibDropzone.addEventListener('click', () => ibInput.click());

// Drag & drop visual feedback
ibDropzone.addEventListener('dragover', e => {
  e.preventDefault();
  ibDropzone.classList.add('drag-over');
});
ibDropzone.addEventListener('dragleave', () => ibDropzone.classList.remove('drag-over'));
ibDropzone.addEventListener('drop', e => {
  e.preventDefault();
  ibDropzone.classList.remove('drag-over');
  processFiles(e.dataTransfer.files);
});

// File input change
ibInput.addEventListener('change', () => {
  processFiles(ibInput.files);
  ibInput.value = ''; // reset so same file can be re-added
});

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function processFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) {
      showToast(`"${file.name}" is not an image.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => renderResult(file, e.target.result);
    reader.readAsDataURL(file);
  });
}

function renderResult(file, dataUrl) {
  const id = 'res-' + Math.random().toString(36).slice(2, 9);

  const item = document.createElement('div');
  item.className = 'result-item';
  item.id = id;

  item.innerHTML = `
    <div class="result-header">
      <img class="result-thumb" src="${dataUrl}" alt="${escapeHtml(file.name)}" />
      <div class="result-meta">
        <div class="result-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</div>
        <div class="result-size">${formatBytes(file.size)} &bull; ${file.type}</div>
      </div>
      <div class="result-actions">
        <button class="btn btn-primary btn-copy-b64" data-id="${id}">Copy Base64</button>
        <button class="btn btn-secondary btn-copy-url" data-id="${id}">Copy Data URL</button>
        <button class="btn btn-secondary btn-remove" data-id="${id}">✕</button>
      </div>
    </div>
    <div class="result-box" data-full="${escapeAttr(dataUrl)}">${escapeHtml(dataUrl.substring(0, 300))}${dataUrl.length > 300 ? '…' : ''}</div>
  `;

  // button events
  item.querySelector('.btn-copy-b64').addEventListener('click', () => {
    const full = item.querySelector('.result-box').dataset.full;
    const base64 = full.split(',')[1] || full;
    navigator.clipboard.writeText(base64).then(() => showToast('Base64 copied!'));
  });

  item.querySelector('.btn-copy-url').addEventListener('click', () => {
    const full = item.querySelector('.result-box').dataset.full;
    navigator.clipboard.writeText(full).then(() => showToast('Data URL copied!'));
  });

  item.querySelector('.btn-remove').addEventListener('click', () => item.remove());

  ibResults.prepend(item);
}

/* Security helpers — prevent XSS from file names */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;');
}
