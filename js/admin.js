import { getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged, getIdTokenResult, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const auth = getAuth(getApp());
const API = "http://127.0.0.1:3001/api/admin";
const $ = (id) => document.getElementById(id);
const statusEl = $("adminStatus");
const adminApp = $("adminApp");
const denied = $("adminDenied");
const errorBox = $("adminError");
let currentUser = null;
let usersCache = [];
let logsCache = [];
let idToken = "";

const esc = (value = "") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date = value => {
  if (!value) return "Nunca";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
};
function showError(error) {
  console.error("MoneyWise Admin:", error);
  errorBox.textContent = error?.message || "Não foi possível concluir a operação.";
  errorBox.hidden = false;
}
function clearError() { errorBox.hidden = true; errorBox.textContent = ""; }
async function api(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + idToken, ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erro HTTP " + response.status);
  return data;
}
function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  $("viewTitle").textContent = ({overview:"Visão geral",users:"Usuários",permissions:"Controle ADM",monitor:"Monitoramento",settings:"Configurações"})[name] || "Painel administrativo";
}
function filteredUsers(mode) {
  const query = (mode === "admins" ? $("adminSearch").value : $("userSearch").value).trim().toLowerCase();
  let list = usersCache.filter(u => (u.displayName + " " + u.email + " " + u.uid).toLowerCase().includes(query));
  if (mode === "users") {
    const filter = $("userFilter").value;
    if (filter === "active") list = list.filter(u => !u.disabled);
    if (filter === "disabled") list = list.filter(u => u.disabled);
    if (filter === "admin") list = list.filter(u => u.admin);
  }
  return list;
}
function identity(user) {
  const avatar = user.photoURL
    ? '<img class="user-avatar" src="' + esc(user.photoURL) + '" alt="" referrerpolicy="no-referrer">'
    : '<div class="user-avatar avatar-placeholder">' + esc((user.displayName || "U").slice(0,1).toUpperCase()) + '</div>';
  return '<div class="user-cell">' + avatar + '<div><strong>' + esc(user.displayName || "Sem nome") +
    '</strong><small>' + esc(user.email || user.uid) + '</small><small class="uid-line">UID: ' + esc(user.uid) + '</small></div></div>';
}
function renderUsers() {
  const list = filteredUsers("users");
  $("usersCount").textContent = list.length + " de " + usersCache.length + " contas";
  $("usersTable").innerHTML = list.length ? list.map(u => {
    let action = u.uid === currentUser.uid ? '<span class="muted">Sua conta</span>' :
      (u.disabled ? '<button class="action-btn" data-action="enable" data-uid="' + esc(u.uid) + '">Reativar</button>' :
      '<button class="action-btn danger" data-action="disable" data-uid="' + esc(u.uid) + '">Bloquear</button>');
    return '<tr><td>' + identity(u) + '</td><td><span class="status-pill ' + (u.disabled ? "off" : "") + '">' +
      (u.disabled ? "Bloqueada" : "Ativa") + '</span></td><td><span class="status-pill ' +
      (u.admin ? "admin" : "") + '">' + (u.admin ? "Administrador" : "Usuário") +
      '</span></td><td>' + esc(date(u.lastSignInAt)) + '</td><td>' + action + '</td></tr>';
  }).join("") : '<tr><td colspan="5" class="empty">Nenhum usuário encontrado.</td></tr>';

  const admins = filteredUsers("admins");
  $("adminsTable").innerHTML = admins.length ? admins.map(u => {
    const action = u.uid === currentUser.uid ? '<span class="muted">Sua conta</span>' :
      (u.admin ? '<button class="action-btn danger" data-action="remove-admin" data-uid="' + esc(u.uid) + '">Remover ADM</button>' :
      '<button class="action-btn" data-action="make-admin" data-uid="' + esc(u.uid) + '">Conceder ADM</button>');
    return '<tr><td>' + identity(u) + '</td><td><span class="status-pill ' + (u.admin ? "admin" : "") + '">' +
      (u.admin ? "Administrador" : "Usuário comum") + '</span></td><td>' + action + '</td></tr>';
  }).join("") : '<tr><td colspan="3" class="empty">Nenhuma conta encontrada.</td></tr>';
}
function renderActivity(logs, id) {
  const target = $(id);
  if (!logs.length) { target.innerHTML = '<p class="muted">Nenhuma atividade registrada ainda.</p>'; return; }
  target.innerHTML = logs.map(log => '<div class="activity-row"><span class="activity-icon">✓</span><div><strong>' +
    esc(log.action || "Atividade") + '</strong><small>' + esc(log.actorEmail || "Administrador") +
    '</small></div><time>' + esc(date(log.createdAt)) + '</time></div>').join("");
}
function loadLogs() {
  $("logsTable").innerHTML = logsCache.length ? logsCache.map(log =>
    '<tr><td>' + esc(date(log.createdAt)) + '</td><td>' + esc(log.actorEmail || "—") +
    '</td><td>' + esc(log.action || "—") + '</td><td>' + esc(log.targetUid || "—") + '</td></tr>'
  ).join("") : '<tr><td colspan="4" class="empty">Nenhum registro encontrado.</td></tr>';
}
async function loadAll() {
  clearError();
  statusEl.textContent = "Consultando Firebase Authentication e Firestore...";
  try {
    const [dashboard, userData, logData, settings] = await Promise.all([
      api("/dashboard"), api("/users"), api("/logs"), api("/settings")
    ]);
    usersCache = userData.users || [];
    logsCache = logData.logs || [];
    $("statTotal").textContent = dashboard.total;
    $("statActive").textContent = dashboard.active;
    $("statDisabled").textContent = dashboard.disabled;
    $("statAdmins").textContent = dashboard.admins;
    $("serviceStatus").textContent = "Conectado ao Firebase";
    $("lastCheck").textContent = date(dashboard.checkedAt);
    $("announcement").value = settings.announcement || "";
    $("announcementEnabled").checked = settings.announcementEnabled === true;
    $("maintenanceMode").checked = settings.maintenanceMode === true;
    renderUsers();
    renderActivity(logsCache.slice(0, 5), "recentActivity");
    loadLogs();
    statusEl.textContent = "Dados reais carregados do Firebase.";
  } catch (error) {
    statusEl.textContent = "Falha ao consultar a API administrativa.";
    showError(error);
  }
}
document.querySelectorAll(".nav-item").forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => showView(b.dataset.goto)));
$("refreshBtn").addEventListener("click", loadAll);
$("userSearch").addEventListener("input", renderUsers);
$("userFilter").addEventListener("change", renderUsers);
$("adminSearch").addEventListener("input", renderUsers);

document.addEventListener("click", async event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const user = usersCache.find(u => u.uid === button.dataset.uid);
  if (!user) return;
  const action = button.dataset.action;
  const isAdminChange = action === "make-admin" || action === "remove-admin";
  const message = isAdminChange
    ? (action === "make-admin" ? "Conceder permissão ADM para " : "Remover permissão ADM de ") + user.email + "?"
    : (action === "disable" ? "Bloquear a conta de " : "Reativar a conta de ") + user.email + "?";
  if (!window.confirm(message + "\nEsta ação será aplicada no Firebase real.")) return;
  button.disabled = true;
  try {
    if (isAdminChange) await api("/users/" + encodeURIComponent(user.uid) + "/admin", {
      method: "POST", body: JSON.stringify({ admin: action === "make-admin" })
    });
    else await api("/users/" + encodeURIComponent(user.uid) + "/status", {
      method: "POST", body: JSON.stringify({ disabled: action === "disable" })
    });
    await loadAll();
  } catch (error) { showError(error); button.disabled = false; }
});
$("saveSettings").addEventListener("click", async () => {
  clearError();
  try {
    await api("/settings", { method: "PUT", body: JSON.stringify({
      announcement: $("announcement").value,
      announcementEnabled: $("announcementEnabled").checked,
      maintenanceMode: $("maintenanceMode").checked
    }) });
    $("settingsStatus").textContent = "Configurações salvas no Firestore.";
    await loadAll();
  } catch (error) { showError(error); }
});
$("adminSair").addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("login.html");
});
onAuthStateChanged(auth, async user => {
  if (!user) { window.location.replace("login.html"); return; }
  currentUser = user;
  try {
    const tokenResult = await getIdTokenResult(user, true);
    if (tokenResult.claims.admin !== true) {
      statusEl.textContent = "Sua conta não possui permissão administrativa.";
      denied.hidden = false;
      return;
    }
    idToken = await user.getIdToken(true);
    $("adminEmail").textContent = user.email || "Administrador";
    adminApp.hidden = false;
    await loadAll();
  } catch (error) {
    showError(error);
    statusEl.textContent = "Falha ao verificar sua permissão.";
  }
});
