import { getApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    getIdTokenResult,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const auth = getAuth(getApp());
const status = document.getElementById("adminStatus");
const content = document.getElementById("adminContent");
const denied = document.getElementById("adminDenied");

onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
        window.location.replace("login.html");
        return;
    }

    try {
        const token = await getIdTokenResult(usuario, true);
        if (token.claims.admin !== true) {
            status.textContent = "Sua conta não tem permissão para acessar esta área.";
            denied.hidden = false;
            return;
        }

        document.getElementById("adminEmail").textContent = usuario.email || "E-mail não disponível";
        document.getElementById("adminUid").textContent = usuario.uid;
        status.textContent = "Identidade e permissão verificadas pelo Firebase.";
        content.hidden = false;
    } catch (erro) {
        console.error("Falha ao verificar administrador:", erro);
        status.textContent = "Não foi possível verificar sua permissão. Atualize a página e tente novamente.";
    }
});

document.getElementById("adminSair").addEventListener("click", async () => {
    await signOut(auth);
    window.location.replace("login.html");
});
