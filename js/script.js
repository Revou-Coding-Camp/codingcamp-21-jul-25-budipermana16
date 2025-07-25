let tasks = [];
let currentFilter = "all";

const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const total = document.getElementById("total");
const completed = document.getElementById("completed");
const pending = document.getElementById("pending");
const progressTxt = document.getElementById("progress-txt");
const searchInput = document.getElementById("search");
const filterSel = document.getElementById("filter");
const modalDiv = document.getElementById("modal");
const toastDiv = document.getElementById("toast");
const themeBtn = document.getElementById("themeBtn");

// Utility
function showToast(msg, color = 'blue') {
  toastDiv.textContent = msg;
  toastDiv.style.background = color === 'red' ? '#ff6b6b' : '';
  toastDiv.classList.add('show');
  setTimeout(() => toastDiv.classList.remove('show'), 1700);
}
function showModal({ title, message, confirmText, cancelText, onConfirm }) {
  modalDiv.innerHTML = `
    <div class="modal-bg">
      <div class="modal-box">
        <div class="modal-title">${title}</div>
        <div class="modal-message">${message}</div>
        <div class="modal-actions">
          <button class="cancel">${cancelText || 'Batal'}</button>
          <button class="ok">${confirmText || 'OK'}</button>
        </div>
      </div>
    </div>
  `;
  modalDiv.querySelector('.cancel').onclick = () => modalDiv.innerHTML = '';
  modalDiv.querySelector('.ok').onclick = () => {
    if (onConfirm) onConfirm();
    modalDiv.innerHTML = '';
  };
}

function renderTasks() {
  let filtered = tasks.filter(task =>
    (currentFilter === "pending" ? !task.done :
     currentFilter === "completed" ? task.done : true)
    && (searchInput.value ? task.text.toLowerCase().includes(searchInput.value.toLowerCase()) : true)
  );

  if (filtered.length === 0) {
    todoList.innerHTML = `
      <li class="empty">
        <div class="empty-art">📝</div>
        <div class="empty-title">Belum ada tugas</div>
        <div class="empty-desc">Ayo tambahkan tugas pertamamu dan produktif hari ini!</div>
      </li>
    `;
  } else {
    todoList.innerHTML = filtered.map((task, i) => `
      <li class="${task.done ? 'completed' : ''}" data-index="${tasks.indexOf(task)}">
        <div class="row">
          <span class="task-text">${task.text}</span>
          <span class="task-date">${task.date ? `📅 ${task.date}` : ''}</span>
        </div>
        <div class="task-actions">
          <button class="done-btn" title="Selesai">${task.done ? "↩️ Undo" : "✔️ Selesai"}</button>
          <button class="edit-btn" title="Edit">✏️ Edit</button>
          <button class="del-btn" title="Hapus">🗑 Hapus</button>
        </div>
      </li>
    `).join("");
  }

  // Stats
  const doneCount = tasks.filter(t => t.done).length;
  total.textContent = tasks.length;
  completed.textContent = doneCount;
  pending.textContent = tasks.length - doneCount;
  let percent = tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);
  progressTxt.textContent = percent + "%";
  document.querySelector('circle.progress').style.strokeDashoffset = 100 - percent;
}

// Event delegation untuk aksi di list
todoList.onclick = function(e) {
  const li = e.target.closest("li[data-index]");
  if (!li) return;
  const idx = parseInt(li.getAttribute("data-index"));
  if (e.target.classList.contains("done-btn")) {
    tasks[idx].done = !tasks[idx].done;
    renderTasks();
    showToast(tasks[idx].done ? 'Tugas selesai!' : 'Tugas dikembalikan!');
  }
  else if (e.target.classList.contains("del-btn")) {
    showModal({
      title: 'Hapus Tugas',
      message: 'Yakin hapus tugas ini?',
      confirmText: 'Hapus', cancelText: 'Batal',
      onConfirm: () => {
        tasks.splice(idx, 1);
        renderTasks();
        showToast('Tugas dihapus!', 'red');
      }
    });
  }
  else if (e.target.classList.contains("edit-btn")) {
    const task = tasks[idx];
    showModal({
      title: 'Edit Tugas',
      message: `
        <input id="edit-text" type="text" style="width:90%;margin-bottom:1em;" value="${task.text.replace(/"/g,"&quot;")}"><br>
        <input id="edit-date" type="date" style="width:60%;" value="${task.date||''}">
      `,
      confirmText: 'Simpan', cancelText: 'Batal',
      onConfirm: () => {
        let newText = document.getElementById('edit-text').value.trim();
        let newDate = document.getElementById('edit-date').value;
        if (!newText) { showToast('Tugas tidak boleh kosong!', 'red'); return; }
        tasks[idx].text = newText;
        tasks[idx].date = newDate;
        renderTasks();
        showToast('Tugas diperbarui!');
      }
    });
    // Fokus otomatis ke input
    setTimeout(() => {
      document.getElementById('edit-text')?.focus();
    }, 30);
  }
};

addBtn.onclick = addTask;
function addTask() {
  const text = input.value.trim();
  const date = dateInput.value;
  if (!text) { showToast('Tugas tidak boleh kosong!', 'red'); return; }
  showModal({
    title: 'Tambah Tugas',
    message: `Yakin ingin menambah tugas:<br><b>${text}</b>${date ? '<br>Deadline: ' + date : ''}?`,
    confirmText: 'Tambah', cancelText: 'Batal',
    onConfirm: () => {
      tasks.push({ text, date, done: false });
      input.value = ""; dateInput.value = "";
      renderTasks();
      showToast('Tugas ditambahkan!');
    }
  });
}
input.onkeydown = e => { if (e.key === "Enter") addTask(); };

// Filter & search
filterSel.onchange = function() {
  currentFilter = this.value;
  renderTasks();
};
searchInput.oninput = renderTasks;

// Theme mode & auto icon
themeBtn.onclick = () => {
  document.body.classList.toggle('dark');
  updateThemeIcon();
};
function updateThemeIcon() {
  const themeIcon = document.getElementById('themeIcon');
  if (document.body.classList.contains('dark')) {
    if (themeIcon) themeIcon.textContent = "🌙";
    themeBtn.title = "Mode Terang";
  } else {
    if (themeIcon) themeIcon.textContent = "☀️";
    themeBtn.title = "Mode Gelap";
  }
}
// Jalankan update icon tema saat awal
updateThemeIcon();

// LocalStorage
if (localStorage.getItem('mytasks')) {
  tasks = JSON.parse(localStorage.getItem('mytasks'));
}
setInterval(() => localStorage.setItem('mytasks', JSON.stringify(tasks)), 2000);

// Render awal
renderTasks();
