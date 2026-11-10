const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();
const auth = getAuth();
const db = getFirestore();
const REGION = "southamerica-east1";

async function listEveryUser() {
    const users = [];
    let pageToken;
    do {
        const page = await auth.listUsers(1000, pageToken);
        users.push(...page.users);
        pageToken = page.pageToken;
    } while (pageToken);
    return users;
}

function requireAdmin(request) {
    if (!request.auth || request.auth.token.admin !== true) {
        throw new HttpsError("permission-denied", "Acesso administrativo necessário.");
    }
    return request.auth;
}

async function audit(actor, action, targetUid = null, details = {}) {
    await db.collection("admin_logs").add({
        actorUid: actor.uid,
        actorEmail: actor.token.email || "",
        action,
        targetUid,
        details,
        createdAt: FieldValue.serverTimestamp()
    });
}

exports.getAdminDashboard = onCall({ region: REGION }, async (request) => {
    const actor = requireAdmin(request);
    const users = await listEveryUser();
    const adminCount = users.filter((u) => u.customClaims && u.customClaims.admin === true).length;
    const disabledCount = users.filter((u) => u.disabled).length;
    const logs = await db.collection("admin_logs").orderBy("createdAt", "desc").limit(8).get();

    return {
        totalUsers: users.length,
        adminCount,
        disabledCount,
        activeCount: users.length - disabledCount,
        recentLogs: logs.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                action: data.action || "atividade",
                actorEmail: data.actorEmail || "",
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
            };
        }),
        checkedAt: new Date().toISOString(),
        checkedBy: actor.uid
    };
});

exports.listAdminUsers = onCall({ region: REGION }, async (request) => {
    requireAdmin(request);
    const users = await listEveryUser();
    const docs = await db.getAll(...users.map((user) => db.collection("usuarios").doc(user.uid)));
    const profiles = new Map(docs.map((doc) => [doc.id, doc.exists ? doc.data() : {}]));

    return {
        users: users.map((user) => {
            const profile = profiles.get(user.uid) || {};
            return {
                uid: user.uid,
                email: user.email || "",
                displayName: user.displayName || profile.nome || "Sem nome",
                photoURL: user.photoURL || profile.foto || "",
                disabled: user.disabled,
                admin: user.customClaims && user.customClaims.admin === true,
                createdAt: user.metadata.creationTime || null,
                lastSignInAt: user.metadata.lastSignInTime || null
            };
        })
    };
});

exports.setUserAdmin = onCall({ region: REGION }, async (request) => {
    const actor = requireAdmin(request);
    const { uid, admin } = request.data || {};
    if (typeof uid !== "string" || typeof admin !== "boolean") {
        throw new HttpsError("invalid-argument", "Informe o usuário e a permissão desejada.");
    }
    if (uid === actor.uid) {
        throw new HttpsError("failed-precondition", "Você não pode alterar sua própria permissão.");
    }

    const target = await auth.getUser(uid);
    const claims = { ...(target.customClaims || {}) };
    if (admin) claims.admin = true;
    else delete claims.admin;

    if (!admin && target.customClaims && target.customClaims.admin === true) {
        const allUsers = await listEveryUser();
        const admins = allUsers.filter((u) => u.customClaims && u.customClaims.admin === true);
        if (admins.length <= 1) {
            throw new HttpsError("failed-precondition", "O sistema precisa manter pelo menos um administrador.");
        }
    }

    await auth.setCustomUserClaims(uid, claims);
    await auth.revokeRefreshTokens(uid);
    await audit(actor, admin ? "admin_concedido" : "admin_removido", uid, { email: target.email || "" });
    return { success: true };
});

exports.setUserDisabled = onCall({ region: REGION }, async (request) => {
    const actor = requireAdmin(request);
    const { uid, disabled } = request.data || {};
    if (typeof uid !== "string" || typeof disabled !== "boolean") {
        throw new HttpsError("invalid-argument", "Informe o usuário e o estado da conta.");
    }
    if (uid === actor.uid) {
        throw new HttpsError("failed-precondition", "Você não pode bloquear sua própria conta.");
    }

    const target = await auth.getUser(uid);
    if (target.customClaims && target.customClaims.admin === true) {
        throw new HttpsError("failed-precondition", "Contas administrativas não podem ser bloqueadas por este painel.");
    }

    await auth.updateUser(uid, { disabled });
    if (disabled) await auth.revokeRefreshTokens(uid);
    await audit(actor, disabled ? "usuario_bloqueado" : "usuario_reativado", uid, { email: target.email || "" });
    return { success: true };
});

exports.getAdminLogs = onCall({ region: REGION }, async (request) => {
    requireAdmin(request);
    const snapshot = await db.collection("admin_logs").orderBy("createdAt", "desc").limit(50).get();
    return {
        logs: snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                actorEmail: data.actorEmail || "",
                action: data.action || "",
                targetUid: data.targetUid || "",
                details: data.details || {},
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
            };
        })
    };
});

exports.getAdminSettings = onCall({ region: REGION }, async (request) => {
    requireAdmin(request);
    const doc = await db.collection("configuracoes").doc("admin").get();
    return doc.exists ? doc.data() : {
        announcementEnabled: false,
        announcement: "",
        maintenanceMode: false
    };
});

exports.saveAdminSettings = onCall({ region: REGION }, async (request) => {
    const actor = requireAdmin(request);
    const data = request.data || {};
    const announcement = typeof data.announcement === "string" ? data.announcement.trim().slice(0, 240) : "";
    const announcementEnabled = data.announcementEnabled === true;
    const maintenanceMode = data.maintenanceMode === true;

    await db.collection("configuracoes").doc("admin").set({
        announcement,
        announcementEnabled,
        maintenanceMode,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actor.uid
    }, { merge: true });

    await audit(actor, "configuracoes_atualizadas", null, {
        announcementEnabled,
        maintenanceMode
    });
    return { success: true };
});
