import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    collection,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================
   CONFIGURAÇÃO FIREBASE
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyCrEBTwrXR0YI7FDfMBJDjIzb2tajTtWlc",
  authDomain: "moneywise-201d9.firebaseapp.com",
  projectId: "moneywise-201d9",
  storageBucket: "moneywise-201d9.firebasestorage.app",
  messagingSenderId: "972820182134",
  appId: "1:972820182134:web:1c6ee4b1cc8cf4ef411b57",
  measurementId: "G-XJJ0D8FXEK"
};


const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);

const provider =
    new GoogleAuthProvider();

    window.abrirLoginGoogle = async function () {

    try {

        await signInWithPopup(
            auth,
            provider
        );

    } catch (erro) {

        console.error(
            "Erro ao fazer login com Google:",
            erro
        );

    }

};


/* =========================================
   ELEMENTOS
========================================= */

const googleButton =
    document.getElementById("googleButton");

const areaLoginGoogle =
    document.getElementById("areaLoginGoogle");

const usuarioGoogle =
    document.getElementById("usuarioGoogle");

const googleNome =
    document.getElementById("googleNome");

const googleEmail =
    document.getElementById("googleEmail");

const googleFoto =
    document.getElementById("googleFoto");

const sairGoogle =
    document.getElementById("sairGoogle");


/* =========================================
   CRIAR BOTÃO
========================================= */

if (googleButton) {

    googleButton.innerHTML = `
        <button
            type="button"
            id="entrarFirebase"
            class="botao-login-firebase"
        >
            <span class="google-g">G</span>
            Fazer login com Google
        </button>
    `;

}


const entrarFirebase =
    document.getElementById("entrarFirebase");


/* =========================================
   ENTRAR
========================================= */

if (entrarFirebase) {

    entrarFirebase.addEventListener(
        "click",
        async function () {

            try {

                await signInWithPopup(
                    auth,
                    provider
                );

            } catch (erro) {

                console.error(
                    "Aviso do login:",
                    erro
                );

            }

        }
    );

}

/* =========================================
   OBSERVAR LOGIN
========================================= */

onAuthStateChanged(
    auth,
    async function (usuario) {

        const modalLogin =
    document.getElementById(
        "modalLoginMoneyWise"
    );

if (modalLogin) {

    modalLogin.classList.remove("ativo");

    setTimeout(function () {

        modalLogin.remove();

    }, 200);

}

        const botaoLogin =
            document.getElementById("googleButton");

        const areaLogin =
            document.getElementById("areaLoginGoogle");

        const areaUsuario =
            document.getElementById("usuarioGoogle");


        if (usuario) {

            /* =========================
               USUÁRIO LOGADO
            ========================= */


            try {

    await setDoc(
        doc(
            db,
            "usuarios",
            usuario.uid
        ),
        {
            nome:
                usuario.displayName ||
                "Usuário",

            email:
                usuario.email || "",

            foto:
                usuario.photoURL || "",

            atualizadoEm:
                serverTimestamp()
        },
        {
            merge: true
        }
    );

    console.log(
        "Usuário salvo no Firestore!"
    );

    if (
    typeof window.carregarMetasDoFirestore ===
    "function"
) {

    await window.carregarMetasDoFirestore();

}

if (
    typeof window.carregarMetasDoFirestore ===
    "function"
) {

    await window.carregarMetasDoFirestore();

}

/* CARREGA AS MOVIMENTAÇÕES DESTE USUÁRIO */

const movimentacoesUsuario =
    await window.carregarMovimentacoesFirestore();

if (
    typeof window.receberMovimentacoesFirestore ===
    "function"
) {

    window.receberMovimentacoesFirestore(
        movimentacoesUsuario
    );

}

/* CARREGA A CARTEIRA BITCOIN DESTE USUÁRIO */

if (
    typeof window.carregarCarteiraBitcoinDoFirestore ===
    "function"
) {

    await window.carregarCarteiraBitcoinDoFirestore();

}


} catch (erro) {

    console.error(
        "Erro ao salvar usuário no Firestore:",
        erro
    );

}

            if (botaoLogin) {
                botaoLogin.style.display = "none";
            }

            if (areaLogin) {
                areaLogin.style.display = "none";
            }

            if (areaUsuario) {
                areaUsuario.style.display = "flex";
                areaUsuario.classList.remove("escondido");
            }


            if (googleNome) {

                googleNome.textContent =
                    usuario.displayName ||
                    "Usuário";

            }


            if (googleEmail) {

                googleEmail.textContent =
                    usuario.email || "";

            }


            if (googleFoto) {

                googleFoto.src =
                    usuario.photoURL || "";

            }


            localStorage.setItem(
                "usuarioMoneyWise",
                JSON.stringify({
                    uid: usuario.uid,
                    nome:
                        usuario.displayName ||
                        "Usuário",
                    email:
                        usuario.email || "",
                    foto:
                        usuario.photoURL || ""
                })
            );


        } else {

            /* =========================
               USUÁRIO DESLOGADO
            ========================= */

            if (botaoLogin) {
                botaoLogin.style.display = "flex";
            }

            if (areaLogin) {
                areaLogin.style.display = "flex";
            }

            if (areaUsuario) {
                areaUsuario.style.display = "none";
                areaUsuario.classList.add("escondido");
            }


            localStorage.removeItem(
                "usuarioMoneyWise"
            );

        }

    }
);


/* =========================================
   SAIR
========================================= */

if (sairGoogle) {

    sairGoogle.addEventListener(
        "click",
        async function () {

            try {

                await signOut(auth);

                window.location.href =
                    "index.html";

            } catch (erro) {

                console.error(
                    "Erro ao sair:",
                    erro
                );

            }

        }
    );

}

/* =========================================
   FIRESTORE - MOVIMENTAÇÕES
========================================= */

window.salvarMovimentacaoFirestore =
    async function (movimentacao) {

        const usuario =
            auth.currentUser;

        if (!usuario) {
            return false;
        }

        try {

            await setDoc(
                doc(
                    db,
                    "usuarios",
                    usuario.uid,
                    "movimentacoes",
                    String(movimentacao.id)
                ),
                {
                    descricao:
                        movimentacao.descricao,

                    valor:
                        movimentacao.valor,

                    tipo:
                        movimentacao.tipo,

                    categoria:
                        movimentacao.categoria,

                    data:
                        movimentacao.data,

                    criadoEm:
                        serverTimestamp()
                }
            );

            console.log(
                "Movimentação salva no Firestore!"
            );

            return true;

        } catch (erro) {

            console.error(
                "Erro ao salvar movimentação:",
                erro
            );

            return false;
        }
    };


window.carregarMovimentacoesFirestore =
    async function () {

        const usuario =
            auth.currentUser;

        if (!usuario) {
            return [];
        }

        try {

            const resultado =
                await getDocs(
                    collection(
                        db,
                        "usuarios",
                        usuario.uid,
                        "movimentacoes"
                    )
                );

            const lista = [];

            resultado.forEach(
                function (documento) {

                    lista.push({
                        id:
                            Number(documento.id),

                        ...documento.data()
                    });

                }
            );

            return lista;

        } catch (erro) {

            console.error(
                "Erro ao carregar movimentações:",
                erro
            );

            return [];
        }
    };


window.removerMovimentacaoFirestore =
    async function (id) {

        const usuario =
            auth.currentUser;

        if (!usuario) {
            return false;
        }

        try {

            await deleteDoc(
                doc(
                    db,
                    "usuarios",
                    usuario.uid,
                    "movimentacoes",
                    String(id)
                )
            );

            console.log(
                "Movimentação removida do Firestore!"
            );

            return true;

        } catch (erro) {

            console.error(
                "Erro ao remover movimentação:",
                erro
            );

            return false;
        }
    };

    /* =========================================
   FIRESTORE - METAS
========================================= */


/* SALVAR META */

window.salvarMetaFirestore =
async function (meta) {

    const usuario =
        auth.currentUser;

    if (!usuario) {

        console.error(
            "Nenhum usuário logado."
        );

        return false;
    }


    try {

        await setDoc(

            doc(
                db,
                "usuarios",
                usuario.uid,
                "metas",
                String(meta.id)
            ),

            {
                id: meta.id,
                nome: meta.nome,
                objetivo: meta.objetivo,
                guardado: meta.guardado,
                resgatada:
                    meta.resgatada || false,

                atualizadoEm:
                    serverTimestamp()
            }

        );


        console.log(
            "Meta salva no Firestore!"
        );

        return true;


    } catch (erro) {

        console.error(
            "Erro ao salvar meta no Firestore:",
            erro
        );

        return false;

    }

};


/* CARREGAR METAS */

window.carregarMetasFirestore =
async function () {

    const usuario =
        auth.currentUser;

    if (!usuario) {
        return [];
    }


    try {

        const referencia =
            collection(
                db,
                "usuarios",
                usuario.uid,
                "metas"
            );


        const resultado =
            await getDocs(
                referencia
            );


        const metasCarregadas = [];


        resultado.forEach(
            function (documento) {

                metasCarregadas.push(
                    documento.data()
                );

            }
        );


        console.log(
            "Metas carregadas do Firestore:",
            metasCarregadas
        );


        return metasCarregadas;


    } catch (erro) {

        console.error(
            "Erro ao carregar metas do Firestore:",
            erro
        );

        return [];

    }

};


/* REMOVER META */

window.removerMetaFirestore =
async function (id) {

    const usuario =
        auth.currentUser;

    if (!usuario) {
        return false;
    }


    try {

        await deleteDoc(

            doc(
                db,
                "usuarios",
                usuario.uid,
                "metas",
                String(id)
            )

        );


        console.log(
            "Meta removida do Firestore!"
        );

        return true;


    } catch (erro) {

        console.error(
            "Erro ao remover meta do Firestore:",
            erro
        );

        return false;

    }

};

/* =========================================
   BITCOIN - SALVAR CARTEIRA NO FIRESTORE
========================================= */

window.salvarCarteiraBitcoinFirestore =
    async function (carteira) {

        const usuario =
            auth.currentUser;

        if (!usuario) {
            return;
        }

        try {

            const referencia =
                doc(
                    db,
                    "usuarios",
                    usuario.uid,
                    "bitcoin",
                    "carteira"
                );

            await setDoc(
                referencia,
                {
                    compras:
                        Array.isArray(carteira)
                            ? carteira
                            : [],

                    atualizadoEm:
                        serverTimestamp()
                }
            );

            console.log(
                "Carteira Bitcoin salva no Firestore!",
                carteira
            );

        } catch (erro) {

            console.error(
                "Erro ao salvar carteira Bitcoin:",
                erro
            );

        }

    };

    /* =========================================
   BITCOIN - CARREGAR CARTEIRA DO FIRESTORE
========================================= */

window.carregarCarteiraBitcoinFirestore =
    async function () {

        const usuario =
            auth.currentUser;

        if (!usuario) {
            return [];
        }

        try {

            const referencia =
                doc(
                    db,
                    "usuarios",
                    usuario.uid,
                    "bitcoin",
                    "carteira"
                );

            const resultado =
                await getDoc(referencia);

            if (!resultado.exists()) {

                console.log(
                    "Nenhuma carteira Bitcoin encontrada."
                );

                return [];
            }

            const dados =
                resultado.data();

            const compras =
                Array.isArray(dados.compras)
                    ? dados.compras
                    : [];

            console.log(
                "Carteira Bitcoin carregada do Firestore:",
                compras
            );

            return compras;

        } catch (erro) {

            console.error(
                "Erro ao carregar carteira Bitcoin:",
                erro
            );

            return [];
        }

    };