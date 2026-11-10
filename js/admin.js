import { getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged, getIdTokenResult, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-functions.js";

const app = getApp();
const auth = getAuth(app);
const functions = getFunctions(app, "southamerica-east1");
const $ = (id) => document.getElementById(id);
const statusEl = $("adminStatus");
const adminApp = $("adminApp");
const denied = $("adminDenied");
const errorBox = $("adminError");
let currentUser = null;
let usersCache = [];

const call = (name, data = {}) => httpsCallable(functions, name)(data).then((r) => r.data);
const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date = (value) => {
    if (!value) return "Nunca";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
};
const actionNames = {
    admin_concedido: "Permissão ADM concedida",
    admin_removido: "Permissão ADM removida",
    usuario_bloqueado: "Conta bloqueada",
    usuario_reativado: "Conta reativada",
    configuracoes_atualizadas: "Configurações atualizadas"
};

function showError(error) {
    console.error("Painel administrativo:", error);
    errorBox.textContent = error && error.message ? error.message : "Não foi possível concluir a operação.";
    errorBox.hidden = false;
}
function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
}
function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.toggle("active", v.id === "view-" + name));
    document.querySelectorAll(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
    const titles = {overview:"Visão geral",users:"Usuários",permissions:"Controle ADM",monitor:"Monitoramento",settings:"Configurações"};
    $("viewTitle").textContent = titles[name] || "Painel administrativo";
}
function renderActivity(logs, id) {
    const target = $(id);
    if (!logs.length) {
        target.innerHTML = '<p class="muted">Nenhuma atividade administrativa registrada ainda.</p>';
        return;
    }
    target.innerHTML = logs.map((log) =>
        '<div class="activity-row"><span class="activity-icon">✓</span><div><strong>' +
        esc(actionNames[log.action] || log.action) + '</strong><small>' + esc(log.actorEmail || "Administrador") +
        '</small></div><time>' + esc(date(log.createdAt)) + '</time></div>'
    ).join("");
}
function filteredUsers(mode) {
    const query = (mode === "admins" ? $("adminSearch").value : $("userSearch").value).trim().toLowerCase();
    let list = usersCache.filter((u) => (u.displayName + " " + u.email + " " + u.uid).toLowerCase().includes(query));
    if (mode === "users") {
        const filter = $("userFilter").value;
        if (filter === "active") list = list.filter((u) => !u.disabled);
        if (filter === "disabled") list = list.filter((u) => u.disabled);
        if (filter === "admin") list = list.filter((u) => u.admin);
    }
    return list;
}
function identity(user) {
    return '<div class="user-cell"><img class="user-avatar" src="' + esc(user.photoURL || "img/favicon.png") +
        '" alt="" onerror="this.onerror=null;this.src=\'img/favicon.png\'"><div><strong>' +
        esc(user.displayName || "Sem nome") + '</strong><small>' + esc(user.email || user.uid) + '</small></div></div>';
}
function renderUsers() {
    const list = filteredUsers("users");
    $("usersCount").textContent = usersCache.length + " contas";
    $("usersTable").innerHTML = list.length ? list.map((u) => {
        let action = '<span class="muted">Protegida</span>';
        if (u.uid !== (currentUser && currentUser.uid) && !u.admin) {
            action = u.disabled
                ? '<button class="action-btn" data-action="enable" data-uid="' + esc(u.uid) + '">Reativar</button>'
                : '<button class="action-btn danger" data-action="disable" data-uid="' + esc(u.uid) + '">Bloquear</button>';
        }
        return '<tr><td>' + identity(u) + '</td><td><span class="status-pill ' + (u.disabled ? "off" : "") + '">' +
            (u.disabled ? "Bloqueada" : "Ativa") + '</span></td><td><span class="status-pill ' +
            (u.admin ? "admin" : "") + '">' + (u.admin ? "Administrador" : "Usuário") +
            '</span></td><td>' + esc(date(u.lastSignInAt)) + '</td><td>' + action + '</td></tr>';
    }).join("") : '<tr><td colspan="5" class="empty">Nenhum usuário encontrado.</td></tr>';

    const admins = filteredUsers("admins");
    $("adminsTable").innerHTML = admins.length ? admins.map((u) => {
        let action = u.uid === (currentUser && currentUser.uid) ? '<span class="muted">Sua conta</span>' :
            u.admin ? '<button class="action-btn danger" data-action="remove-admin" data-uid="' + esc(u.uid) + '">Remover ADM</button>' :
            '<button class="action-btn" data-action="make-admin" data-uid="' + esc(u.uid) + '">Conceder ADM</button>';
        return '<tr><td>' + identity(u) + '</td><td><span class="status-pill ' + (u.admin ? "admin" : "") + '">' +
            (u.admin ? "Administrador" : "Usuário comum") + '</span></td><td>' + action + '</td></tr>';
    }).join("") : '<tr><td colspan="3" class="empty">Nenhuma conta encontrada.</td></tr>';
}
async function loadDashboard() {
    const d = await call("getAdminDashboard");
    $("statTotal").textContent = d.totalUsers;
    $("statActive").textContent = d.activeCount;
    $("statDisabled").textContent = d.disabledCount;
    $("statAdmins").textContent = d.adminCount;
    $("serviceStatus").textContent = "Operacional";
    $("lastCheck").textContent = new Date(d.checkedAt).toLocaleTimeString("pt-BR");
    renderActivity(d.recentLogs || [], "recentActivity");
}
async function loadUsers() {
    const d = await call("listAdminUsers");
    usersCache = d.users || [];
    renderUsers();
}
async function loadLogs() {
    const d = await call("getAdminLogs");
    $("logsTable").innerHTML = d.logs.length ? d.logs.map((log) =>
        '<tr><td>' + esc(date(log.createdAt)) + '</td><td>' + esc(log.actorEmail || "—") +
        '</td><td>' + esc(actionNames[log.action] || log.action) + '</td><td>' +
        esc(log.targetUid || "—") + '</td></tr>'
    ).join("") : '<tr><td colspan="4" class="empty">Nenhum registro encontrado.</td></tr>';
}
async function loadSettings() {
    const d = await call("getAdminSettings");
    $("announcement").value = d.announcement || "";
    $("announcementEnabled").checked = d.announcementEnabled === true;
    $("maintenanceMode").checked = d.maintenanceMode === true;
}
async function loadAll() {
    clearError();
    statusEl.textContent = "Carregando dados administrativos...";
    try {
        await Promise.all([loadDashboard(), loadUsers(), loadLogs(), loadSettings()]);
        statusEl.textContent = "Sessão administrativa verificada. Dados atualizados.";
    } catch (error) {
        $("serviceStatus").textContent = "Falha";
        showError(error);
        statusEl.textContent = "Não foi possível carregar todos os dados.";
    }
}

document.querySelectorAll(".nav-item").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => showView(b.dataset.goto)));
$("refreshBtn").addEventListener("click", loadAll);
$("userSearch").addEventListener("input", renderUsers);
$("userFilter").addEventListener("change", renderUsers);
$("adminSearch").addEventListener("input", renderUsers);

document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    const uid = button.dataset.uid;
    const user = usersCache.find((u) => u.uid === uid);
    if (!user) return;
    const label = user.email || user.displayName;
    const prompts = {
        disable: "Bloquear a conta de " + label + "?",
        enable: "Reativar a conta de " + label + "?",
        "make-admin": "Conceder permissão administrativa para " + label + "?",
        "remove-admin": "Remover a permissão administrativa de " + label + "?"
    };
    if (!window.confirm(prompts[action] || "Confirmar alteração?")) return;
    button.disabled = true;
    clearError();
    try {
        if (action === "disable" || action === "enable") {
            await call("setUserDisabled", {uid, disabled: action === "disable"});
        } else {
            await call("setUserAdmin", {uid, admin: action === "make-admin"});
        }
        await Promise.all([loadDashboard(), loadUsers(), loadLogs()]);
        statusEl.textContent = "Alteração administrativa concluída.";
    } catch (error) {
        showError(error);
    } finally {
        button.disabled = false;
    }
});

$("saveSettings").addEventListener("click", async () => {
    const button = $("saveSettings");
    const status = $("settingsStatus");
    button.disabled = true;
    status.textContent = "Salvando...";
    clearError();
    try {
        await call("saveAdminSettings", {
            announcement: $("announcement").value,
            announcementEnabled: $("announcementEnabled").checked,
            maintenanceMode: $("maintenanceMode").checked
        });
        status.textContent = "Configurações salvas com sucesso.";
        await loadLogs();
    } catch (error) {
        status.textContent = "";
        showError(error);
    } finally {
        button.disabled = false;
    }
});

$("adminSair").addEventListener("click", async () => {
    await signOut(auth);
    window.location.replace("login.html");
});

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.replace("login.html");
        return;
    }
    currentUser = user;
    try {
        const token = await getIdTokenResult(user, true);
        if (token.claims.admin !== true) {
            statusEl.textContent = "Sua conta não possui permissão administrativa.";
            denied.hidden = false;
            return;
        }
        $("adminEmail").textContent = user.email || "Administrador";
        adminApp.hidden = false;
        await loadAll();
    } catch (error) {
        showError(error);
        statusEl.textContent = "Falha ao verificar a permissão administrativa.";
    }
});
