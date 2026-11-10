import { getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged, getIdTokenResult, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const app = getApp();
const auth = getAuth(app);
const $ = (id) => document.getElementById(id);
const statusEl = $("adminStatus");
const adminApp = $("adminApp");
const denied = $("adminDenied");
const errorBox = $("adminError");
let currentUser = null;
let usersCache = [];
let logsCache = [];

const DEMO_USERS = [
    {uid:"demo-001",displayName:"Mariana Costa",email:"mariana.costa@exemplo.com",photoURL:"",disabled:false,admin:false,lastSignInAt:"2026-11-10T14:42:00"},
    {uid:"demo-002",displayName:"Pedro Henrique",email:"pedro.henrique@exemplo.com",photoURL:"",disabled:false,admin:false,lastSignInAt:"2026-11-10T13:18:00"},
    {uid:"demo-003",displayName:"Ana Clara",email:"ana.clara@exemplo.com",photoURL:"",disabled:true,admin:false,lastSignInAt:"2026-11-08T19:30:00"},
    {uid:"demo-004",displayName:"Rafael Martins",email:"rafael.martins@exemplo.com",photoURL:"",disabled:false,admin:true,lastSignInAt:"2026-11-10T12:05:00"},
    {uid:"demo-005",displayName:"Julia Ferreira",email:"julia.ferreira@exemplo.com",photoURL:"",disabled:false,admin:false,lastSignInAt:"2026-11-09T17:50:00"},
    {uid:"demo-006",displayName:"Lucas Almeida",email:"lucas.almeida@exemplo.com",photoURL:"",disabled:true,admin:false,lastSignInAt:"2026-11-06T10:12:00"}
];

const actionNames = {
    admin_concedido:"Permissão ADM concedida",
    admin_removido:"Permissão ADM removida",
    usuario_bloqueado:"Conta bloqueada",
    usuario_reativado:"Conta reativada",
    configuracoes_atualizadas:"Configurações atualizadas"
};
const esc = (value = "") => String(value).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const date = (value) => {
    if (!value) return "Nunca";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
};
function showError(error) {
    console.error("Painel administrativo (demonstração):", error);
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
function addLog(action, targetUid) {
    logsCache.unshift({action,actorEmail:currentUser.email || "Administrador",targetUid:targetUid || "—",createdAt:new Date().toISOString()});
}
function renderActivity(logs, id) {
    const target = $(id);
    if (!logs.length) {
        target.innerHTML = '<p class="muted">Nenhuma atividade demonstrativa registrada.</p>';
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
    return '<div class="user-cell"><div class="user-avatar avatar-placeholder">' +
        esc((user.displayName || "U").slice(0,1).toUpperCase()) + '</div><div><strong>' +
        esc(user.displayName || "Sem nome") + '</strong><small>' + esc(user.email || user.uid) + '</small></div></div>';
}
function renderUsers() {
    const list = filteredUsers("users");
    $("usersCount").textContent = usersCache.length + " contas demonstrativas";
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
function loadDashboard() {
    const total = usersCache.length;
    const disabled = usersCache.filter((u) => u.disabled).length;
    $("statTotal").textContent = total;
    $("statActive").textContent = total - disabled;
    $("statDisabled").textContent = disabled;
    $("statAdmins").textContent = usersCache.filter((u) => u.admin).length;
    $("serviceStatus").textContent = "Modo demonstração";
    $("lastCheck").textContent = new Date().toLocaleTimeString("pt-BR");
    renderActivity(logsCache.slice(0,5), "recentActivity");
}
function loadLogs() {
    $("logsTable").innerHTML = logsCache.length ? logsCache.map((log) =>
        '<tr><td>' + esc(date(log.createdAt)) + '</td><td>' + esc(log.actorEmail || "—") +
        '</td><td>' + esc(actionNames[log.action] || log.action) + '</td><td>' +
        esc(log.targetUid || "—") + '</td></tr>'
    ).join("") : '<tr><td colspan="4" class="empty">Nenhum registro demonstrativo.</td></tr>';
}
function loadSettings() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("moneywiseAdminDemoSettings") || "{}"); } catch (_) {}
    $("announcement").value = saved.announcement || "Bem-vindo ao MoneyWise!";
    $("announcementEnabled").checked = saved.announcementEnabled === true;
    $("maintenanceMode").checked = saved.maintenanceMode === true;
}
function loadAll() {
    clearError();
    statusEl.textContent = "Carregando dados de demonstração...";
    usersCache = DEMO_USERS.map((u) => ({...u}));
    if (currentUser) {
        usersCache.unshift({
            uid:currentUser.uid,displayName:currentUser.displayName || "Administrador",
            email:currentUser.email || "Administrador",photoURL:currentUser.photoURL || "",
            disabled:false,admin:true,lastSignInAt:currentUser.metadata && currentUser.metadata.lastSignInTime || new Date().toISOString()
        });
    }
    logsCache = [
        {action:"usuario_reativado",actorEmail:"admin@moneywise.demo",targetUid:"demo-003",createdAt:new Date(Date.now()-18*60000).toISOString()},
        {action:"configuracoes_atualizadas",actorEmail:"admin@moneywise.demo",targetUid:"configuracoes/admin",createdAt:new Date(Date.now()-95*60000).toISOString()},
        {action:"admin_concedido",actorEmail:"admin@moneywise.demo",targetUid:"demo-004",createdAt:new Date(Date.now()-4*3600000).toISOString()},
        {action:"usuario_bloqueado",actorEmail:"admin@moneywise.demo",targetUid:"demo-006",createdAt:new Date(Date.now()-24*3600000).toISOString()}
    ];
    renderUsers();
    loadDashboard();
    loadLogs();
    loadSettings();
    statusEl.textContent = "Modo demonstração ativo. Nenhuma alteração será feita em contas reais.";
}
document.querySelectorAll(".nav-item").forEach((b) => b.addEventListener("click", () => showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => showView(b.dataset.goto)));
$("refreshBtn").addEventListener("click", loadAll);
$("userSearch").addEventListener("input", renderUsers);
$("userFilter").addEventListener("change", renderUsers);
$("adminSearch").addEventListener("input", renderUsers);

document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const user = usersCache.find((u) => u.uid === button.dataset.uid);
    if (!user) return;
    const action = button.dataset.action;
    const label = user.email || user.displayName;
    const prompts = {
        disable:"Simular bloqueio de " + label + "?",
        enable:"Simular reativação de " + label + "?",
        "make-admin":"Simular concessão de ADM para " + label + "?",
        "remove-admin":"Simular remoção de ADM de " + label + "?"
    };
    if (!window.confirm(prompts[action] || "Confirmar simulação?")) return;
    if (action === "disable") { user.disabled = true; addLog("usuario_bloqueado",user.uid); }
    if (action === "enable") { user.disabled = false; addLog("usuario_reativado",user.uid); }
    if (action === "make-admin") { user.admin = true; addLog("admin_concedido",user.uid); }
    if (action === "remove-admin") { user.admin = false; addLog("admin_removido",user.uid); }
    renderUsers();
    loadDashboard();
    loadLogs();
    statusEl.textContent = "Simulação concluída. Nenhuma conta real foi alterada.";
});
$("saveSettings").addEventListener("click", () => {
    const saved = {
        announcement:$("announcement").value,
        announcementEnabled:$("announcementEnabled").checked,
        maintenanceMode:$("maintenanceMode").checked
    };
    localStorage.setItem("moneywiseAdminDemoSettings",JSON.stringify(saved));
    addLog("configuracoes_atualizadas","configuracoes/admin");
    loadLogs();
    loadDashboard();
    $("settingsStatus").textContent = "Preferências salvas neste navegador (demonstração).";
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
        const token = await getIdTokenResult(user,true);
        if (token.claims.admin !== true) {
            statusEl.textContent = "Sua conta não possui permissão administrativa.";
            denied.hidden = false;
            return;
        }
        $("adminEmail").textContent = user.email || "Administrador";
        adminApp.hidden = false;
        loadAll();
    } catch (error) {
        showError(error);
        statusEl.textContent = "Falha ao verificar a permissão administrativa.";
    }
});
