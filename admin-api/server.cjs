/**
 * API local do painel administrativo MoneyWise.
 * A chave do Firebase Admin SDK fica SOMENTE no computador e nunca no Git.
 */
const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const path = require("node:path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const PORT = Number(process.env.ADMIN_API_PORT || 3001);
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";
const absolutePath = path.resolve(credentialsPath);

if (!fs.existsSync(absolutePath)) {
  console.error("Credencial não encontrada. Coloque serviceAccountKey.json na raiz do projeto (sem enviar ao GitHub).");
  process.exit(1);
}
const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
if (serviceAccount.project_id !== "moneywise-90448") {
  console.error("A credencial não pertence ao projeto moneywise-90448.");
  process.exit(1);
}
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();
const app = express();
const allowedOrigins = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://luskinha11.github.io"
]);
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.has(origin)) return callback(null, true);
  return callback(new Error("Origem não autorizada."));
}}));
app.use(express.json({ limit: "32kb" }));

async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: "Entre novamente na sua conta." });
    const decoded = await auth.verifyIdToken(match[1], true);
    if (decoded.admin !== true) return res.status(403).json({ error: "Permissão administrativa necessária." });
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}
app.use("/api/admin", requireAdmin);

app.get("/api/admin/dashboard", async (_req, res) => {
  try {
    const result = await auth.listUsers(1000);
    const users = result.users;
    res.json({
      total: users.length,
      active: users.filter(u => !u.disabled).length,
      disabled: users.filter(u => u.disabled).length,
      admins: users.filter(u => u.customClaims && u.customClaims.admin === true).length,
      checkedAt: new Date().toISOString()
    });
  } catch (error) { res.status(500).json({ error: "Não foi possível consultar o Firebase Authentication." }); }
});

app.get("/api/admin/users", async (_req, res) => {
  try {
    const all = [];
    let pageToken;
    do {
      const page = await auth.listUsers(1000, pageToken);
      all.push(...page.users);
      pageToken = page.pageToken;
    } while (pageToken);
    const profiles = await Promise.all(all.map(async user => {
      let profile = {};
      try {
        const snap = await db.collection("usuarios").doc(user.uid).get();
        if (snap.exists) profile = snap.data() || {};
      } catch (_) {}
      return {
        uid: user.uid,
        displayName: user.displayName || profile.nome || "Sem nome",
        email: user.email || "",
        photoURL: user.photoURL || profile.foto || "",
        disabled: user.disabled,
        admin: user.customClaims?.admin === true,
        emailVerified: user.emailVerified,
        createdAt: user.metadata.creationTime || null,
        lastSignInAt: user.metadata.lastSignInTime || null
      };
    }));
    res.json({ users: profiles });
  } catch (error) { res.status(500).json({ error: "Falha ao listar usuários reais do Firebase." }); }
});

app.post("/api/admin/users/:uid/status", async (req, res) => {
  try {
    const { disabled } = req.body;
    if (typeof disabled !== "boolean") return res.status(400).json({ error: "Informe um status válido." });
    if (req.params.uid === req.admin.uid) return res.status(400).json({ error: "Você não pode bloquear sua própria conta." });
    const user = await auth.getUser(req.params.uid);
    await auth.updateUser(req.params.uid, { disabled });
    await db.collection("admin_logs").add({
      action: disabled ? "usuario_bloqueado" : "usuario_reativado",
      targetUid: req.params.uid, actorUid: req.admin.uid, actorEmail: req.admin.email || null,
      details: { email: user.email || null }, createdAt: FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Não foi possível atualizar esta conta." }); }
});

app.post("/api/admin/users/:uid/admin", async (req, res) => {
  try {
    const { admin } = req.body;
    if (typeof admin !== "boolean") return res.status(400).json({ error: "Informe uma permissão válida." });
    if (req.params.uid === req.admin.uid) return res.status(400).json({ error: "Você não pode alterar sua própria permissão." });
    const target = await auth.getUser(req.params.uid);
    const claims = { ...(target.customClaims || {}) };
    if (admin) claims.admin = true; else delete claims.admin;
    await auth.setCustomUserClaims(req.params.uid, claims);
    await auth.revokeRefreshTokens(req.params.uid);
    await db.collection("admin_logs").add({
      action: admin ? "admin_concedido" : "admin_removido",
      targetUid: req.params.uid, actorUid: req.admin.uid, actorEmail: req.admin.email || null,
      details: { email: target.email || null }, createdAt: FieldValue.serverTimestamp()
    });
    res.json({ success: true, message: "Permissão atualizada. O usuário precisará entrar novamente." });
  } catch (error) { res.status(500).json({ error: "Não foi possível atualizar a permissão administrativa." }); }
});

app.get("/api/admin/logs", async (_req, res) => {
  try {
    const snap = await db.collection("admin_logs").orderBy("createdAt", "desc").limit(100).get();
    res.json({ logs: snap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate?.().toISOString() || null })) });
  } catch (error) {
    if (error.code === 9 || /index/i.test(error.message || "")) return res.json({ logs: [] });
    res.status(500).json({ error: "Não foi possível carregar o histórico administrativo." });
  }
});

app.get("/api/admin/settings", async (_req, res) => {
  try {
    const snap = await db.collection("configuracoes").doc("admin").get();
    res.json(snap.exists ? snap.data() : { announcement: "", announcementEnabled: false, maintenanceMode: false });
  } catch (error) { res.status(500).json({ error: "Falha ao carregar configurações." }); }
});

app.put("/api/admin/settings", async (req, res) => {
  try {
    const data = {
      announcement: String(req.body.announcement || "").slice(0, 240),
      announcementEnabled: req.body.announcementEnabled === true,
      maintenanceMode: req.body.maintenanceMode === true,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: req.admin.email || req.admin.uid
    };
    await db.collection("configuracoes").doc("admin").set(data, { merge: true });
    await db.collection("admin_logs").add({
      action: "configuracoes_atualizadas", targetUid: "configuracoes/admin",
      actorUid: req.admin.uid, actorEmail: req.admin.email || null,
      createdAt: FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Não foi possível salvar as configurações." }); }
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "MoneyWise Admin API local" }));
app.listen(PORT, "127.0.0.1", () => console.log("MoneyWise Admin API em http://127.0.0.1:" + PORT));
