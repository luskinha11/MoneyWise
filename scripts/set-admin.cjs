/**
 * Concede a claim administrativa usando credenciais locais do Firebase Admin SDK.
 * Nunca coloque o JSON da conta de serviço no GitHub.
 *
 * Uso:
 *   GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json" npm run set-admin -- email@exemplo.com
 */
const fs = require("node:fs");
const path = require("node:path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

async function main() {
    const email = (process.argv[2] || "").trim().toLowerCase();
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!email || !email.includes("@")) {
        throw new Error("Informe o e-mail da conta que receberá a permissão.");
    }
    if (!credentialsPath) {
        throw new Error("Defina GOOGLE_APPLICATION_CREDENTIALS apontando para o JSON privado da conta de serviço.");
    }

    const absolutePath = path.resolve(credentialsPath);
    if (!fs.existsSync(absolutePath)) {
        throw new Error("Arquivo de credenciais não encontrado: " + absolutePath);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
    if (serviceAccount.project_id !== "moneywise-201d9") {
        throw new Error("As credenciais não pertencem ao projeto Firebase do MoneyWise.");
    }

    initializeApp({ credential: cert(serviceAccount) });
    const auth = getAuth();
    const usuario = await auth.getUserByEmail(email);
    const claimsAtuais = usuario.customClaims || {};

    await auth.setCustomUserClaims(usuario.uid, {
        ...claimsAtuais,
        admin: true
    });
    await auth.revokeRefreshTokens(usuario.uid);

    console.log("Permissão administrativa atribuída com sucesso.");
    console.log("Conta:", usuario.email);
    console.log("UID:", usuario.uid);
    console.log("Agora saia e entre novamente no MoneyWise para atualizar o token.");
}

main().catch((erro) => {
    console.error("Não foi possível atribuir a permissão:", erro.message);
    process.exitCode = 1;
});
