/* MONEYWISE — PARTE 1 DE 4
   Trecho original: linhas 1–2021.
   Cole esta parte inteira e depois a próxima logo abaixo.
*/

/* =====================================================
   MONEYWISE
===================================================== */

/* =====================================================
   PROTEÇÃO DE AÇÕES - LOGIN OBRIGATÓRIO
===================================================== */

function usuarioEstaLogado() {

    const usuario =
        localStorage.getItem(
            "usuarioMoneyWise"
        );

    return usuario !== null;
}

function exigirLogin() {

    if (usuarioEstaLogado()) {
        return true;
    }

    mostrarAvisoLogin();

    return false;
}

function mostrarAvisoLogin() {

    /* Evita abrir o modal duas vezes */

    if (document.getElementById("modalLoginMoneyWise")) {
        return;
    }

    const fundo = document.createElement("div");

    fundo.id = "modalLoginMoneyWise";
    fundo.className = "modal-login-fundo";

    fundo.innerHTML = `

        <div class="modal-login-card">

        <div class="modal-login-icone">
            <img
                src="img/favicon.png"
                alt="MoneyWise"
                class="modal-login-logo"
            >
        </div>

            <p class="modal-login-label">
                ACESSO NECESSÁRIO
            </p>

            <h2>
                Faça login para continuar
            </h2>

            <p class="modal-login-texto">
                Para utilizar esta função do MoneyWise,
                você precisa estar conectado à sua conta Google.
            </p>

            <div class="modal-login-acoes">

                <button
                    class="modal-login-cancelar"
                    onclick="fecharAvisoLogin()"
                >
                    AGORA NÃO
                </button>

                <button
                    class="modal-login-entrar"
                    onclick="irParaLogin()"
                >
                    FAZER LOGIN
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(fundo);

    requestAnimationFrame(function () {

        fundo.classList.add("ativo");

    });

}

function fecharAvisoLogin() {

    const modal =
        document.getElementById(
            "modalLoginMoneyWise"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("ativo");

    setTimeout(function () {

        modal.remove();

    }, 200);

}

function irParaLogin() {

    if (
        typeof window.abrirLoginGoogle ===
        "function"
    ) {

        window.abrirLoginGoogle();

        return;
    }

    console.error(
        "Firebase ainda não foi carregado."
    );

}

/* =====================================================
   MODAL PADRÃO MONEYWISE
===================================================== */

function fecharModalMoneyWise() {
    const modal = document.getElementById("modalMoneyWise");

    if (!modal) return;

    modal.classList.remove("ativo");

    setTimeout(function () {
        modal.remove();
    }, 200);
}


function mostrarMensagemMoneyWise(
    titulo,
    mensagem,
    tipo = "AVISO"
) {

    const antigo =
        document.getElementById("modalMoneyWise");

    if (antigo) {
        antigo.remove();
    }

    const fundo =
        document.createElement("div");

    fundo.id = "modalMoneyWise";
    fundo.className = "modal-moneywise-fundo";

    fundo.innerHTML = `
        <div class="modal-moneywise-card">

            <div class="modal-moneywise-icone">
                <img
                    src="img/favicon.png"
                    alt="MoneyWise"
                >
            </div>

            <p class="modal-moneywise-label">
                ${tipo}
            </p>

            <h2>
                ${titulo}
            </h2>

            <p class="modal-moneywise-texto">
                ${mensagem}
            </p>

            <div class="modal-moneywise-acoes">

                <button
                    class="modal-moneywise-confirmar"
                    onclick="fecharModalMoneyWise()"
                >
                    OK
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(fundo);

    requestAnimationFrame(function () {
        fundo.classList.add("ativo");
    });
}


function mostrarConfirmacaoMoneyWise(
    titulo,
    mensagem,
    textoConfirmar = "CONFIRMAR"
) {

    return new Promise(function (resolve) {

        const antigo =
            document.getElementById("modalMoneyWise");

        if (antigo) {
            antigo.remove();
        }

        const fundo =
            document.createElement("div");

        fundo.id = "modalMoneyWise";
        fundo.className = "modal-moneywise-fundo";

        fundo.innerHTML = `
            <div class="modal-moneywise-card">

                <div class="modal-moneywise-icone">
                    <img
                        src="img/favicon.png"
                        alt="MoneyWise"
                    >
                </div>

                <p class="modal-moneywise-label">
                    CONFIRMAÇÃO
                </p>

                <h2>
                    ${titulo}
                </h2>

                <p class="modal-moneywise-texto">
                    ${mensagem}
                </p>

                <div class="modal-moneywise-acoes">

                    <button
                        class="modal-moneywise-cancelar"
                        id="modalMoneyWiseCancelar"
                    >
                        CANCELAR
                    </button>

                    <button
                        class="modal-moneywise-confirmar"
                        id="modalMoneyWiseConfirmar"
                    >
                        ${textoConfirmar}
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(fundo);

        requestAnimationFrame(function () {
            fundo.classList.add("ativo");
        });

        document
            .getElementById("modalMoneyWiseCancelar")
            .onclick = function () {

                fecharModalMoneyWise();
                resolve(false);
            };

        document
            .getElementById("modalMoneyWiseConfirmar")
            .onclick = function () {

                fecharModalMoneyWise();
                resolve(true);
            };
    });
}

/* =====================================================
   FINANÇAS
===================================================== */

let movimentacoes =
    JSON.parse(
        localStorage.getItem("movimentacoesMoneyWise")
    ) || [];

const descricaoInput =
    document.getElementById("descricao");

const valorInput =
    document.getElementById("valor");

const tipoInput =
    document.getElementById("tipo");

    const categoriaInput =
    document.getElementById("categoria");

const dataMovimentacaoInput =
    document.getElementById("dataMovimentacao");

const adicionarBtn =
    document.getElementById("adicionar");

const limparTudoBtn =
    document.getElementById("limparTudo");

const listaMovimentacoes =
    document.getElementById("listaMovimentacoes");

const saldoElemento =
    document.getElementById("saldo");

const receitasElemento =
    document.getElementById("receitas");

const despesasElemento =
    document.getElementById("despesas");

const saldoTopo =
    document.getElementById("saldoTopo");

function formatarDinheiro(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}

function salvarMovimentacoes() {

    localStorage.setItem(
        "movimentacoesMoneyWise",
        JSON.stringify(movimentacoes)
    );

}

/* =====================================================
   RECEBER MOVIMENTAÇÕES DO FIRESTORE
===================================================== */

window.receberMovimentacoesFirestore =
    function (dados) {

        if (!Array.isArray(dados)) {
            return;
        }

        movimentacoes = dados;

        localStorage.setItem(
            "movimentacoesMoneyWise",
            JSON.stringify(movimentacoes)
        );

        atualizarTela();

        if (
            typeof atualizarRelatorios ===
            "function"
        ) {
            atualizarRelatorios();
        }

        console.log(
            "Movimentações carregadas do Firestore:",
            movimentacoes
        );
    };

function calcularResumo() {

    let receitas = 0;
    let despesas = 0;

    movimentacoes.forEach(function (movimentacao) {

        if (movimentacao.tipo === "receita") {

            receitas += movimentacao.valor;

        } else {

            despesas += movimentacao.valor;

        }

    });

    return {

        receitas: receitas,

        despesas: despesas,

        saldo: receitas - despesas

    };

}

/* =====================================================
   HISTÓRICO DO SALDO - 24 HORAS
===================================================== */

let historicoSaldo24h =
    JSON.parse(
        localStorage.getItem(
            "historicoSaldo24hMoneyWise"
        )
    ) || [];

function salvarHistoricoSaldo24h() {

    localStorage.setItem(
        "historicoSaldo24hMoneyWise",
        JSON.stringify(
            historicoSaldo24h
        )
    );

}

/* REGISTRA O SALDO ATUAL */

function registrarSaldo24h() {

    const resumo =
        calcularResumo();

    const agora =
        Date.now();

    historicoSaldo24h.push({

        horario:
            agora,

        saldo:
            resumo.saldo

    });

    /* REMOVE REGISTROS COM MAIS DE 24 HORAS */

    const limite =
        agora -
        (
            24 *
            60 *
            60 *
            1000
        );

    historicoSaldo24h =
        historicoSaldo24h.filter(
            function (registro) {

                return registro.horario >=
                    limite;

            }
        );

    salvarHistoricoSaldo24h();

    desenharGraficoSaldo24h();

}

function atualizarTela() {

    const resumo =
        calcularResumo();

    /* =========================
       SALDO DO TOPO
    ========================= */

if (saldoTopo) {

    saldoTopo.textContent =
        formatarDinheiro(resumo.saldo);

    saldoTopo.classList.remove(
        "valor-verde",
        "valor-vermelho",
        "valor-neutro"
    );

    if (resumo.saldo > 0) {

        saldoTopo.classList.add("valor-verde");

    } else if (resumo.saldo < 0) {

        saldoTopo.classList.add("valor-vermelho");

    } else {

        saldoTopo.classList.add("valor-neutro");

    }

}

    /* =========================
       SALDO DA PÁGINA FINANÇAS
    ========================= */

if (saldoElemento) {

    saldoElemento.textContent =
        formatarDinheiro(resumo.saldo);

    saldoElemento.classList.remove(
        "valor-verde",
        "valor-vermelho",
        "valor-neutro"
    );

    if (resumo.saldo > 0) {

        saldoElemento.classList.add("valor-verde");

    } else if (resumo.saldo < 0) {

        saldoElemento.classList.add("valor-vermelho");

    } else {

        saldoElemento.classList.add("valor-neutro");

    }

}

    /* =========================
       RECEITAS
    ========================= */

    if (receitasElemento) {

        receitasElemento.textContent =
            formatarDinheiro(resumo.receitas);

    }

    /* =========================
       DESPESAS
    ========================= */

    if (despesasElemento) {

        despesasElemento.textContent =
            formatarDinheiro(resumo.despesas);

    }

    /* =========================
       LISTA DE MOVIMENTAÇÕES
    ========================= */

    if (!listaMovimentacoes) {

        return;

    }

    listaMovimentacoes.innerHTML = "";

    if (movimentacoes.length === 0) {

        listaMovimentacoes.innerHTML = `
            <p class="lista-vazia">
                Nenhuma movimentação registrada.
            </p>
        `;

        return;

    }

    movimentacoes.forEach(function (movimentacao) {

        const item =
            document.createElement("div");

        item.classList.add(
            "movimentacao"
        );

        const valorFormatado =
            formatarDinheiro(
                movimentacao.valor
            );

        item.innerHTML = `

            <span>
                ${movimentacao.descricao}
            </span>

            <span>
                ${
                    movimentacao.tipo === "receita"
                        ? "Receita"
                        : "Despesa"
                }
            </span>

            <span class="${movimentacao.tipo}">
                ${
                    movimentacao.tipo === "receita"
                        ? "+"
                        : "-"
                }

                ${valorFormatado}
            </span>

            <button
                class="remover"
                onclick="removerMovimentacao(${movimentacao.id})"
            >
                REMOVER
            </button>

        `;

        listaMovimentacoes.appendChild(
            item
        );

    });

}

function adicionarMovimentacao() {
if (!exigirLogin()) {
    return;
}
    if (
        !descricaoInput ||
        !valorInput ||
        !tipoInput
    ) {

        return;

    }

    const descricao =
        descricaoInput.value.trim();

    const valor =
        Number(valorInput.value);

    const tipo =
        tipoInput.value;

        const categoria =
    categoriaInput
        ? categoriaInput.value
        : "Outros";

const data =
    dataMovimentacaoInput &&
    dataMovimentacaoInput.value

        ? dataMovimentacaoInput.value

        : new Date()
            .toISOString()
            .split("T")[0];

    if (descricao === "") {

    mostrarMensagemMoneyWise(
        "Descrição necessária",
        "Digite uma descrição para registrar a movimentação.",
        "ATENÇÃO"
    );

        return;

    }

    if (!valor || valor <= 0) {

if (!valor || valor <= 0) {

    mostrarMensagemMoneyWise(
        "Valor inválido",
        "Digite um valor maior que zero.",
        "ATENÇÃO"
    );

    return;
}

        return;

    }

const novaMovimentacao = {

    id: Date.now(),

    descricao: descricao,

    valor: valor,

    tipo: tipo,

    categoria: categoria,

    data: data

};

movimentacoes.push(
    novaMovimentacao
);

/* SALVA TAMBÉM NO FIRESTORE */

if (
    typeof window.salvarMovimentacaoFirestore ===
    "function"
) {

    window.salvarMovimentacaoFirestore(
        novaMovimentacao
    );

}

    salvarMovimentacoes();

    descricaoInput.value = "";

    valorInput.value = "";

    if (dataMovimentacaoInput) {

    dataMovimentacaoInput.value =
        new Date()
            .toISOString()
            .split("T")[0];

}

    descricaoInput.focus();

if (dataMovimentacaoInput) {

    dataMovimentacaoInput.value =
        new Date()
            .toISOString()
            .split("T")[0];

}

registrarSaldo24h();

atualizarTela();

}

async function removerMovimentacao(id) {

    movimentacoes =
        movimentacoes.filter(
            function (movimentacao) {

                return movimentacao.id !== id;

            }
        );

    salvarMovimentacoes();
    registrarSaldo24h();
    atualizarTela();

    /* REMOVE TAMBÉM DO FIRESTORE */

    if (
        typeof window.removerMovimentacaoFirestore ===
        "function"
    ) {

        await window.removerMovimentacaoFirestore(
            id
        );

    }

}

async function limparTudo() {

    if (
        movimentacoes.length === 0
    ) {

mostrarMensagemMoneyWise(
    "Nada para remover",
    "Você ainda não possui movimentações registradas.",
    "AVISO"
);

        return;
    }

const confirmar =
    await mostrarConfirmacaoMoneyWise(
        "Remover movimentações?",
        "Todas as movimentações cadastradas serão removidas. Esta ação não poderá ser desfeita.",
        "REMOVER"
    );

if (!confirmar) {
    return;
}

    /* GUARDA OS IDs ANTES DE LIMPAR */

    const idsParaRemover =
        movimentacoes.map(
            function (movimentacao) {
                return movimentacao.id;
            }
        );

    /* REMOVE DO FIRESTORE */

    if (
        typeof window.removerMovimentacaoFirestore ===
        "function"
    ) {

        for (const id of idsParaRemover) {

            await window.removerMovimentacaoFirestore(
                id
            );

        }

    }

    /* LIMPA O MONEYWISE */

    movimentacoes = [];

    salvarMovimentacoes();
    registrarSaldo24h();
    atualizarTela();

    console.log(
        "Todas as movimentações foram removidas!"
    );

}

if (adicionarBtn) {

    adicionarBtn.addEventListener(
        "click",
        adicionarMovimentacao
    );

}

if (limparTudoBtn) {

    limparTudoBtn.addEventListener(
        "click",
        limparTudo
    );

}

if (valorInput) {

    valorInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                adicionarMovimentacao();

            }

        }
    );

}

atualizarTela();

/* =====================================================
   MERCADO FINANCEIRO
===================================================== */

const dolarValor =
    document.getElementById("dolarValor");

const dolarVariacao =
    document.getElementById("dolarVariacao");

const euroValor =
    document.getElementById("euroValor");

const euroVariacao =
    document.getElementById("euroVariacao");

const bitcoinValor =
    document.getElementById("bitcoinValor");

const bitcoinVariacao =
    document.getElementById("bitcoinVariacao");

const realValor =
    document.getElementById("realValor");

const realVariacao =
    document.getElementById("realVariacao");

const ultimaAtualizacao =
    document.getElementById("ultimaAtualizacao");

function atualizarVariacao(
    elemento,
    valor
) {

    if (!elemento) {

        return;

    }

    const variacao =
        Number(valor);

    elemento.classList.remove(
        "market-up",
        "market-down"
    );

    if (variacao >= 0) {

        elemento.classList.add(
            "market-up"
        );

        elemento.textContent =
            "▲ +" +
            variacao.toFixed(2) +
            "%";

    } else {

        elemento.classList.add(
            "market-down"
        );

        elemento.textContent =
            "▼ " +
            variacao.toFixed(2) +
            "%";

    }

}

async function carregarMercado() {

    if (!dolarValor) {

        return;

    }

    try {

        const resposta =
            await fetch(
                "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL"
            );

        if (!resposta.ok) {

            throw new Error(
                "Não foi possível carregar as cotações."
            );

        }

        const dados =
            await resposta.json();

        const dolar =
            dados.USDBRL;

        const valorDolar =
            Number(dolar.bid);

        dolarValor.textContent =
            valorDolar.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        atualizarVariacao(
            dolarVariacao,
            dolar.pctChange
        );

        const euro =
            dados.EURBRL;

        const valorEuro =
            Number(euro.bid);

        euroValor.textContent =
            valorEuro.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        atualizarVariacao(
            euroVariacao,
            euro.pctChange
        );

        const bitcoin =
            dados.BTCBRL;

        const valorBitcoin =
            Number(bitcoin.bid);

        bitcoinValor.textContent =
            valorBitcoin.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0
                }
            );

        atualizarVariacao(
            bitcoinVariacao,
            bitcoin.pctChange
        );

        const realEmDolar =
            1 / valorDolar;

        realValor.textContent =
            "US$ " +
            realEmDolar.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4
                }
            );

        atualizarVariacao(
            realVariacao,
            -Number(dolar.pctChange)
        );

        const agora =
            new Date();

        if (ultimaAtualizacao) {

            ultimaAtualizacao.textContent =
                " às " +
                agora.toLocaleTimeString(
                    "pt-BR",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    }
                );

        }

    } catch (erro) {

        console.error(
            "Erro ao atualizar mercado:",
            erro
        );

        dolarValor.textContent =
            "Indisponível";

        if (euroValor) {

            euroValor.textContent =
                "Indisponível";

        }

        if (bitcoinValor) {

            bitcoinValor.textContent =
                "Indisponível";

        }

        if (realValor) {

            realValor.textContent =
                "Indisponível";

        }

    }

}

carregarMercado();

const intervaloMercado =
    window.innerWidth <= 600
        ? 60000
        : 30000;

setInterval(
    carregarMercado,
    intervaloMercado
);

/* =====================================================
   LOGIN GOOGLE
===================================================== */

/*
   COLE AQUI SOMENTE O CLIENT ID.

   NÃO COLOQUE A CHAVE SECRETA.
*/

const GOOGLE_CLIENT_ID =
    "300618201504-qvgtrlp1e26e41hgnosiuvbq6q34ms17.apps.googleusercontent.com";

const googleButton =
    document.getElementById(
        "googleButton"
    );

const areaLoginGoogle =
    document.getElementById(
        "areaLoginGoogle"
    );

const usuarioGoogle =
    document.getElementById(
        "usuarioGoogle"
    );

const googleFoto =
    document.getElementById(
        "googleFoto"
    );

const googleNome =
    document.getElementById(
        "googleNome"
    );

const googleEmail =
    document.getElementById(
        "googleEmail"
    );

const sairGoogle =
    document.getElementById(
        "sairGoogle"
    );

function decodificarTokenGoogle(token) {

    try {

        const base64Url =
            token.split(".")[1];

        const base64 =
            base64Url
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        const jsonPayload =
            decodeURIComponent(

                atob(base64)

                    .split("")

                    .map(
                        function (caractere) {

                            return "%" +
                                (
                                    "00" +
                                    caractere
                                        .charCodeAt(0)
                                        .toString(16)
                                ).slice(-2);

                        }
                    )

                    .join("")

            );

        return JSON.parse(
            jsonPayload
        );

    } catch (erro) {

        console.error(
            "Erro ao ler dados do Google:",
            erro
        );

        return null;

    }

}

function usuarioEstaLogado() {

    const usuario =
        localStorage.getItem(
            "usuarioMoneyWise"
        );

    return usuario !== null;
}

function renderizarBotaoGoogle() {

    if (
        !googleButton ||
        typeof google === "undefined" ||
        !google.accounts
    ) {

        return;

    }

    googleButton.innerHTML = "";

    google.accounts.id.renderButton(

        googleButton,

        {
            theme: "filled_black",

            size: "medium",

            text: "signin_with",

            shape: "pill",

            logo_alignment: "left",

            locale: "pt-BR",

            width: 210
        }

    );

}

/* =====================================================
   METAS FINANCEIRAS
===================================================== */

let metas =
    JSON.parse(
        localStorage.getItem("metasMoneyWise")
    ) || [];

/* ELEMENTOS */

const nomeMeta =
    document.getElementById("nomeMeta");

const valorObjetivo =
    document.getElementById("valorObjetivo");

const valorInicial =
    document.getElementById("valorInicial");

const criarMetaBtn =
    document.getElementById("criarMeta");

const listaMetas =
    document.getElementById("listaMetas");

const totalMetas =
    document.getElementById("totalMetas");

const metasConcluidas =
    document.getElementById("metasConcluidas");

const totalGuardado =
    document.getElementById("totalGuardado");

/* SALVAR */

function salvarMetas() {

    localStorage.setItem(
        "metasMoneyWise",
        JSON.stringify(metas)
    );

}

async function carregarMetasDoFirestore() {

    if (
        typeof window.carregarMetasFirestore !==
        "function"
    ) {
        return;
    }

    const metasDoBanco =
        await window.carregarMetasFirestore();

    if (!Array.isArray(metasDoBanco)) {
        return;
    }

    metas = metasDoBanco;

    salvarMetas();

    atualizarMetas();

    console.log(
        "Metas sincronizadas com o Firestore:",
        metas
    );

}

window.carregarMetasDoFirestore =
    carregarMetasDoFirestore;

/* CRIAR META */

function criarNovaMeta() {

    if (!exigirLogin()) {
        return;
    }

    if (
        !nomeMeta ||
        !valorObjetivo ||
        !valorInicial
    ) {

        return;

    }

    const nome =
        nomeMeta.value.trim();

    const objetivo =
        Number(valorObjetivo.value);

    const inicial =
        Number(valorInicial.value) || 0;

    if (nome === "") {

mostrarMensagemMoneyWise(
    "Nome necessário",
    "Digite um nome para criar sua meta financeira.",
    "ATENÇÃO"
);

        return;

    }

    if (
        !objetivo ||
        objetivo <= 0
    ) {

mostrarMensagemMoneyWise(
    "Objetivo inválido",
    "Digite um valor objetivo maior que zero.",
    "ATENÇÃO"
);

        return;

    }

    if (inicial < 0) {

mostrarMensagemMoneyWise(
    "Valor inicial inválido",
    "O valor inicial da meta não pode ser negativo.",
    "ATENÇÃO"
);

        return;

    }

const novaMeta = {

    id:
        Date.now(),

    nome:
        nome,

    objetivo:
        objetivo,

    guardado:
        inicial,

    resgatada:
        false

};

    metas.push(
        novaMeta
    );

    salvarMetas();

    if (
    typeof window.salvarMetaFirestore ===
    "function"
) {

    window.salvarMetaFirestore(
        novaMeta
    );

}

    nomeMeta.value = "";

    valorObjetivo.value = "";

    valorInicial.value = "";

    nomeMeta.focus();

    atualizarMetas();

}

/* =========================================
   ATUALIZAR
========================================= */

function atualizarMetas() {

    if (!listaMetas) {

        return;

    }

    metas.forEach(function (meta) {

    if (meta.resgatada === undefined) {
        meta.resgatada = false;
    }

});

    listaMetas.innerHTML = "";

    /* RESUMO */

    let concluidas = 0;
    let dinheiroGuardado = 0;

    metas.forEach(function (meta) {

if (!meta.resgatada) {

    dinheiroGuardado +=
        meta.guardado;

}

        if (
            meta.guardado >=
            meta.objetivo
        ) {

            concluidas++;

        }

    });

    if (totalMetas) {

        totalMetas.textContent =
            metas.length;

    }

    if (metasConcluidas) {

        metasConcluidas.textContent =
            concluidas;

    }

    if (totalGuardado) {

        totalGuardado.textContent =
            formatarDinheiro(
                dinheiroGuardado
            );

    }

    /* SEM METAS */

    if (metas.length === 0) {

        listaMetas.innerHTML = `

            <div class="metas-vazio">

                <h3>
                    Nenhuma meta criada
                </h3>

                <p>
                    Crie sua primeira meta financeira
                    utilizando o formulário acima.
                </p>

            </div>

        `;

        return;

    }

    /* CRIAR CARDS */

    metas.forEach(function (meta) {

        let porcentagem =
            (
                meta.guardado /
                meta.objetivo
            ) * 100;

        if (porcentagem > 100) {

            porcentagem = 100;

        }

        const concluida =
            meta.guardado >=
            meta.objetivo;

        const card =
            document.createElement(
                "div"
            );

        card.classList.add(
            "meta-card"
        );

        if (concluida) {

            card.classList.add(
                "concluida"
            );

        }

        card.innerHTML = `

            <div class="meta-card-topo">

                <div>

                    <p class="label">
                        OBJETIVO
                    </p>

                    <h3>
                        ${meta.nome}
                    </h3>

                </div>

                <span class="meta-status">

${
    meta.resgatada
        ? "RESGATADA"
        : concluida
            ? "META CONCLUÍDA"
            : "EM ANDAMENTO"
}

                </span>

            </div>

            <div class="meta-valores">

                <span class="meta-guardado">

                    ${formatarDinheiro(
                        meta.guardado
                    )}

                </span>

                <span class="meta-objetivo">

                    de
                    ${formatarDinheiro(
                        meta.objetivo
                    )}

                </span>

            </div>

            <div class="meta-porcentagem">

                ${porcentagem.toFixed(0)}%
                concluído

            </div>

            <div class="meta-barra">

                <div
                    class="meta-progresso"
                    style="
                        width:
                        ${porcentagem}%
                    ">
                </div>

            </div>

            <div class="meta-acoes">

                <input
                    type="number"
                    id="valorMeta-${meta.id}"
                    placeholder="Adicionar valor"
                    min="0"
                    step="0.01"
                >

                <button
                    class="meta-adicionar"
                    onclick="
                        adicionarValorMeta(
                            ${meta.id}
                        )
                    ">

                    ADICIONAR

                </button>

                ${
    concluida && !meta.resgatada
        ? `
            <button
                class="meta-resgatar"
                onclick="resgatarMeta(${meta.id})"
            >
                RESGATAR
            </button>
        `
        : ""
}

                <button
                    class="meta-remover"
                    onclick="
                        removerMeta(
                            ${meta.id}
                        )
                    ">

                    REMOVER

                </button>

            </div>

        `;

        listaMetas.appendChild(
            card
        );

    });

}

/* =========================================
   ADICIONAR DINHEIRO
========================================= */

function adicionarValorMeta(id) {

    if (!exigirLogin()) {
        return;
    }
    const input =
        document.getElementById(
            "valorMeta-" + id
        );

    if (!input) {

        return;

    }

    const valor =
        Number(input.value);

    if (
        !valor ||
        valor <= 0
    ) {

mostrarMensagemMoneyWise(
    "Valor inválido",
    "Digite um valor maior que zero para adicionar à sua meta.",
    "ATENÇÃO"
);

        return;

    }

    const meta =
        metas.find(
            function (meta) {

                return meta.id === id;

            }
        );

    if (!meta) {

        return;

    }

const restante =
    meta.objetivo -
    meta.guardado;

if (valor > restante) {

    mostrarMensagemMoneyWise(
        "Valor acima do necessário",
        "Você não pode adicionar mais dinheiro do que o necessário para completar esta meta.",
        "ATENÇÃO"
    );

    return;

}

    meta.guardado +=
        valor;

    salvarMetas();

    if (
    typeof window.salvarMetaFirestore ===
    "function"
) {
    window.salvarMetaFirestore(meta);
}

    atualizarMetas();

}

/* =========================================
   RESGATAR META
========================================= */

async function resgatarMeta(id) {

    if (!exigirLogin()) {
        return;
    }

    const meta =
        metas.find(function (meta) {

            return meta.id === id;

        });

    if (!meta) {
        return;
    }

    if (meta.resgatada) {

mostrarMensagemMoneyWise(
    "Meta já resgatada",
    "O dinheiro desta meta já foi enviado para o seu saldo.",
    "AVISO"
);

        return;
    }

    if (meta.guardado < meta.objetivo) {

mostrarMensagemMoneyWise(
    "Meta ainda não concluída",
    "Complete o valor objetivo antes de realizar o resgate.",
    "AVISO"
);

        return;
    }

const confirmar =
    await mostrarConfirmacaoMoneyWise(
        "Resgatar dinheiro?",
        "Deseja resgatar " +
        formatarDinheiro(meta.guardado) +
        " e adicionar esse valor ao seu saldo?",
        "RESGATAR"
    );

if (!confirmar) {
    return;
}

    /* ADICIONA O DINHEIRO NAS FINANÇAS */

const movimentacaoResgate = {

    id:
        Date.now(),

    descricao:
        "Resgate da meta: " +
        meta.nome,

    valor:
        meta.guardado,

    tipo:
        "receita",

    categoria:
        "Metas",

    data:
        new Date()
            .toISOString()
            .split("T")[0]

};

movimentacoes.push(
    movimentacaoResgate
);

salvarMovimentacoes();

if (
    typeof window.salvarMovimentacaoFirestore ===
    "function"
) {

    window.salvarMovimentacaoFirestore(
        movimentacaoResgate
    );

}

registrarSaldo24h();

    /* MARCA A META COMO RESGATADA */

    meta.resgatada =
        true;

    salvarMetas();

    if (
    typeof window.salvarMetaFirestore ===
    "function"
) {
    window.salvarMetaFirestore(meta);
}

    atualizarMetas();

    atualizarTela();

mostrarMensagemMoneyWise(
    "Resgate realizado!",
    "O dinheiro da meta foi adicionado ao seu saldo.",
    "SUCESSO"
);

}

/* =========================================
   REMOVER META
========================================= */

async function removerMeta(id) {
    const confirmar =
        await mostrarConfirmacaoMoneyWise(
            "Remover meta?",
            "Esta meta será removida permanentemente.",
            "REMOVER"
        );

    if (!confirmar) {
        return;
    }

metas =
    metas.filter(
        function (meta) {

            return meta.id !== id;

        }
    );

salvarMetas();

if (
    typeof window.removerMetaFirestore ===
    "function"
) {

    await window.removerMetaFirestore(
        id
    );

}

atualizarMetas();

}

/* BOTÃO CRIAR */

if (criarMetaBtn) {

    criarMetaBtn.addEventListener(
        "click",
        criarNovaMeta
    );

}

/* ENTER */

if (valorInicial) {

    valorInicial.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                criarNovaMeta();

            }

        }
    );

}

/* INICIAR */

atualizarMetas();


/* MONEYWISE — PARTE 2 DE 4
   Trecho original: linhas 2022–2688.
   Cole esta parte inteira e depois a próxima logo abaixo.
*/

/* =====================================================
   SIMULADOR BITCOIN
===================================================== */

let carteiraBitcoin =
    JSON.parse(
        localStorage.getItem("carteiraBitcoinMoneyWise")
    ) || [];

/* =========================================
   CARREGAR CARTEIRA DO FIRESTORE
========================================= */

async function carregarCarteiraBitcoinDoFirestore() {

    if (typeof window.carregarCarteiraBitcoinFirestore !== "function") {
        return false;
    }

    try {
        const dados = await window.carregarCarteiraBitcoinFirestore();

        if (!Array.isArray(dados)) {
            return false;
        }

        carteiraBitcoin = dados;

        localStorage.setItem(
            "carteiraBitcoinMoneyWise",
            JSON.stringify(carteiraBitcoin)
        );

        atualizarCarteiraBitcoin();

        console.log(
            "Carteira Bitcoin sincronizada com o Firestore:",
            carteiraBitcoin
        );

        return true;

    } catch (erro) {
        console.error(
            "Erro ao sincronizar carteira Bitcoin:",
            erro
        );
        return false;
    }
}

window.carregarCarteiraBitcoinDoFirestore =
    carregarCarteiraBitcoinDoFirestore;

/* Tenta carregar quando o Firebase terminar de iniciar. */
let tentativasCarteiraBitcoin = 0;

const intervaloCarteiraBitcoin = setInterval(async function () {
    tentativasCarteiraBitcoin++;

    const carregou =
        await carregarCarteiraBitcoinDoFirestore();

    if (carregou || tentativasCarteiraBitcoin >= 20) {
        clearInterval(intervaloCarteiraBitcoin);
    }
}, 300);

let cotacaoBitcoinAtual = 0;

const btcCotacao =
    document.getElementById("btcCotacao");

const btcInvestido =
    document.getElementById("btcInvestido");

const btcQuantidade =
    document.getElementById("btcQuantidade");

const btcValorAtual =
    document.getElementById("btcValorAtual");

const btcResultado =
    document.getElementById("btcResultado");

const btcPorcentagem =
    document.getElementById("btcPorcentagem");

const valorCompraBitcoin =
    document.getElementById("valorCompraBitcoin");

const comprarBitcoinBtn =
    document.getElementById("comprarBitcoin");

const limparBitcoinBtn =
    document.getElementById("limparBitcoin");

const listaComprasBitcoin =
    document.getElementById("listaComprasBitcoin");

async function carregarCotacaoBitcoin() {

    if (!btcCotacao) {
        return;
    }

    try {

        const resposta = await fetch(
            "https://economia.awesomeapi.com.br/last/BTC-BRL"
        );

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar cotação do Bitcoin"
            );
        }

        const dados =
            await resposta.json();

        cotacaoBitcoinAtual =
            Number(dados.BTCBRL.bid);

        btcCotacao.textContent =
            formatarDinheiro(
                cotacaoBitcoinAtual
            );

        atualizarCarteiraBitcoin();

    } catch (erro) {

        btcCotacao.textContent =
            "Indisponível";

        console.error(
            "Erro ao carregar Bitcoin:",
            erro
        );
    }
}

/* =========================================
   COMPRAR BITCOIN
========================================= */

function comprarBitcoin() {

    if (!exigirLogin()) {
        return;
    }

    if (
        !valorCompraBitcoin ||
        cotacaoBitcoinAtual <= 0
    ) {
        return;
    }

    const valor =
        Number(
            valorCompraBitcoin.value
        );

    if (
        !valor ||
        valor <= 0
    ) {

mostrarMensagemMoneyWise(
    "Valor inválido",
    "Digite um valor maior que zero para realizar a simulação.",
    "ATENÇÃO"
);

        return;
    }

    const quantidadeBTC =
        valor /
        cotacaoBitcoinAtual;

    carteiraBitcoin.push({

        id:
            Date.now(),

        valorInvestido:
            valor,

        quantidade:
            quantidadeBTC,

        cotacaoCompra:
            cotacaoBitcoinAtual,

        data:
            new Date().toLocaleString(
                "pt-BR"
            )

    });

    localStorage.setItem(
        "carteiraBitcoinMoneyWise",
        JSON.stringify(carteiraBitcoin)
    );

    if (
        typeof window.salvarCarteiraBitcoinFirestore ===
        "function"
    ) {

        window.salvarCarteiraBitcoinFirestore(
            carteiraBitcoin
        );

    }

    valorCompraBitcoin.value = "";

    atualizarCarteiraBitcoin();
}

/* =========================================
   ATUALIZAR CARTEIRA
========================================= */

function atualizarCarteiraBitcoin() {

    if (!btcQuantidade) {
        return;
    }

    let totalInvestido = 0;
    let quantidadeTotal = 0;

    carteiraBitcoin.forEach(
        function (compra) {

            totalInvestido +=
                Number(compra.valorInvestido) || 0;

            quantidadeTotal +=
                Number(compra.quantidade) || 0;

        }
    );

    const valorAtual =
        quantidadeTotal *
        cotacaoBitcoinAtual;

    const resultado =
        valorAtual -
        totalInvestido;

    let porcentagem = 0;

    if (totalInvestido > 0) {

        porcentagem =
            (
                resultado /
                totalInvestido
            ) * 100;

    }

    btcInvestido.textContent =
        formatarDinheiro(
            totalInvestido
        );

    btcQuantidade.textContent =
        quantidadeTotal.toFixed(8) +
        " BTC";

    btcValorAtual.textContent =
        formatarDinheiro(
            valorAtual
        );

    btcResultado.textContent =
        formatarDinheiro(
            resultado
        );

    btcPorcentagem.textContent =
        porcentagem.toFixed(2) +
        "%";

    btcResultado.classList.remove(
        "bitcoin-positivo",
        "bitcoin-negativo",
        "bitcoin-neutro"
    );

    btcPorcentagem.classList.remove(
        "bitcoin-positivo",
        "bitcoin-negativo",
        "bitcoin-neutro"
    );

    if (resultado > 0) {

        btcResultado.classList.add(
            "bitcoin-positivo"
        );

        btcPorcentagem.classList.add(
            "bitcoin-positivo"
        );

    } else if (resultado < 0) {

        btcResultado.classList.add(
            "bitcoin-negativo"
        );

        btcPorcentagem.classList.add(
            "bitcoin-negativo"
        );

    } else {

        btcResultado.classList.add(
            "bitcoin-neutro"
        );

        btcPorcentagem.classList.add(
            "bitcoin-neutro"
        );

    }

    atualizarHistoricoBitcoin();
}

/* HISTÓRICO */

function atualizarHistoricoBitcoin() {

    if (!listaComprasBitcoin) {
        return;
    }

    listaComprasBitcoin.innerHTML = "";

    if (carteiraBitcoin.length === 0) {

        listaComprasBitcoin.innerHTML = `

            <p class="lista-vazia">
                Nenhuma compra simulada.
            </p>

        `;

        return;
    }

    carteiraBitcoin.forEach(
        function (compra) {

            const valorAtualCompra =
                compra.quantidade *
                cotacaoBitcoinAtual;

            const resultadoCompra =
                valorAtualCompra -
                compra.valorInvestido;

            let porcentagemCompra = 0;

            if (compra.valorInvestido > 0) {

                porcentagemCompra =
                    (
                        resultadoCompra /
                        compra.valorInvestido
                    ) * 100;
            }

            let classeResultado =
                "bitcoin-neutro";

            if (resultadoCompra > 0) {

                classeResultado =
                    "bitcoin-positivo";

            } else if (resultadoCompra < 0) {

                classeResultado =
                    "bitcoin-negativo";
            }

            const item =
                document.createElement("div");

            item.classList.add(
                "compra-bitcoin"
            );

            item.innerHTML = `

                <div>

                    <span>
                        Investido:
                    </span>

                    <strong>
                        ${formatarDinheiro(
                            compra.valorInvestido
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Quantidade:
                    </span>

                    <strong>
                        ${compra.quantidade.toFixed(8)}
                        BTC
                    </strong>

                </div>

                <div>

                    <span>
                        BTC na compra:
                    </span>

                    <strong>
                        ${formatarDinheiro(
                            compra.cotacaoCompra
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Valor atual:
                    </span>

                    <strong class="${classeResultado}">
                        ${formatarDinheiro(
                            valorAtualCompra
                        )}
                    </strong>

                </div>

                <div>

                    <span>
                        Resultado:
                    </span>

                    <strong class="${classeResultado}">

                        ${
                            resultadoCompra > 0
                                ? "+"
                                : ""
                        }

                        ${formatarDinheiro(
                            resultadoCompra
                        )}

                        (
                        ${
                            porcentagemCompra > 0
                                ? "+"
                                : ""
                        }

                        ${porcentagemCompra.toFixed(2)}%
                        )

                    </strong>

                </div>

            `;

            listaComprasBitcoin.appendChild(
                item
            );

        }
    );

}
/* LIMPAR CARTEIRA */

async function limparCarteiraBitcoin() {

    if (
        carteiraBitcoin.length === 0
    ) {

mostrarMensagemMoneyWise(
    "Carteira vazia",
    "Não existem compras simuladas para remover.",
    "AVISO"
);

        return;

    }

const confirmar =
    await mostrarConfirmacaoMoneyWise(
        "Limpar carteira?",
        "Todas as compras simuladas de Bitcoin serão removidas.",
        "LIMPAR CARTEIRA"
    );

if (!confirmar) {
    return;
}

    carteiraBitcoin = [];

    localStorage.setItem(
        "carteiraBitcoinMoneyWise",
        JSON.stringify(carteiraBitcoin)
    );

    if (
        typeof window.salvarCarteiraBitcoinFirestore ===
        "function"
    ) {
        window.salvarCarteiraBitcoinFirestore(
            carteiraBitcoin
        );
    }

    atualizarCarteiraBitcoin();

}

/* EVENTOS */

if (comprarBitcoinBtn) {

    comprarBitcoinBtn.addEventListener(
        "click",
        comprarBitcoin
    );

}

if (limparBitcoinBtn) {

    limparBitcoinBtn.addEventListener(
        "click",
        limparCarteiraBitcoin
    );

}

if (valorCompraBitcoin) {

    valorCompraBitcoin.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                comprarBitcoin();

            }

        }
    );

}

/* INICIAR */

carregarCotacaoBitcoin();

const intervaloCotacaoBitcoin =
    window.innerWidth <= 600
        ? 60000
        : 30000;

setInterval(
    carregarCotacaoBitcoin,
    intervaloCotacaoBitcoin
);

/* =====================================================
   AVISO DE LOGIN OBRIGATÓRIO
===================================================== */

window.addEventListener(
    "load",
    function () {

        const parametros =
            new URLSearchParams(
                window.location.search
            );

        if (
            parametros.get("login")
            === "necessario"
        ) {

            const areaLogin =
                document.querySelector(
                    ".conta-area"
                );


                /* MONEYWISE — PARTE 3 DE 4
   Trecho original: linhas 2689–4230.
   Cole esta parte inteira e depois a próxima logo abaixo.
*/


            if (areaLogin) {

                areaLogin.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

                areaLogin.classList.add(
                    "login-destaque"
                );

                setTimeout(
                    function () {

                        areaLogin.classList.remove(
                            "login-destaque"
                        );

                    },
                    3000
                );

            }

        }

    }
);

/* =====================================================
   RELATÓRIOS FINANCEIROS
===================================================== */

const relatorioReceitas =
    document.getElementById(
        "relatorioReceitas"
    );

const relatorioDespesas =
    document.getElementById(
        "relatorioDespesas"
    );

const relatorioEconomizado =
    document.getElementById(
        "relatorioEconomizado"
    );

const relatorioMaiorGasto =
    document.getElementById(
        "relatorioMaiorGasto"
    );

const relatorioMaiorGastoNome =
    document.getElementById(
        "relatorioMaiorGastoNome"
    );

const textoComparacao =
    document.getElementById(
        "textoComparacao"
    );

const barraReceitas =
    document.getElementById(
        "barraReceitas"
    );

const barraDespesas =
    document.getElementById(
        "barraDespesas"
    );

const valorBarraReceitas =
    document.getElementById(
        "valorBarraReceitas"
    );

const valorBarraDespesas =
    document.getElementById(
        "valorBarraDespesas"
    );

const listaCategorias =
    document.getElementById(
        "listaCategorias"
    );

const graficoSaldo =
    document.getElementById(
        "graficoSaldo"
    );

/* =====================================================
   PEGAR MÊS
===================================================== */

function obterMesData(data) {

    if (!data) {

        return null;

    }

    return data.substring(
        0,
        7
    );

}

/* =====================================================
   ATUALIZAR RELATÓRIOS
===================================================== */

function atualizarRelatorios() {

    if (!relatorioReceitas) {

        return;

    }

    const hoje =
        new Date();

    const mesAtual =
        hoje
            .toISOString()
            .substring(0, 7);

    const mesAnteriorData =
        new Date(
            hoje.getFullYear(),
            hoje.getMonth() - 1,
            1
        );

    const mesAnterior =
        mesAnteriorData
            .toISOString()
            .substring(0, 7);

    let receitasMes = 0;

    let despesasMes = 0;

    let despesasAnterior = 0;

    let maiorGasto = null;

    const categorias = {};

    movimentacoes.forEach(
        function (movimentacao) {

            const mes =
                obterMesData(
                    movimentacao.data
                );

            /* MOVIMENTAÇÕES ANTIGAS */

            const categoria =
                movimentacao.categoria ||
                "Outros";

            if (
                mes === mesAtual
            ) {

                if (
                    movimentacao.tipo ===
                    "receita"
                ) {

                    receitasMes +=
                        movimentacao.valor;

                } else {

                    despesasMes +=
                        movimentacao.valor;

                    categorias[categoria] =
                        (
                            categorias[categoria] ||
                            0
                        ) +
                        movimentacao.valor;

                    if (
                        !maiorGasto ||
                        movimentacao.valor >
                        maiorGasto.valor
                    ) {

                        maiorGasto =
                            movimentacao;

                    }

                }

            }

            if (
                mes === mesAnterior &&
                movimentacao.tipo ===
                "despesa"
            ) {

                despesasAnterior +=
                    movimentacao.valor;

            }

        }
    );

    /* ECONOMIZADO */

    const economizado =
        receitasMes -
        despesasMes;

    relatorioReceitas.textContent =
        formatarDinheiro(
            receitasMes
        );

    relatorioDespesas.textContent =
        formatarDinheiro(
            despesasMes
        );

    relatorioEconomizado.textContent =
        formatarDinheiro(
            economizado
        );

    relatorioEconomizado.classList.remove(
        "valor-verde",
        "valor-vermelho",
        "valor-neutro"
    );

    if (economizado > 0) {

        relatorioEconomizado.classList.add(
            "valor-verde"
        );

    } else if (economizado < 0) {

        relatorioEconomizado.classList.add(
            "valor-vermelho"
        );

    } else {

        relatorioEconomizado.classList.add(
            "valor-neutro"
        );

    }

    /* MAIOR GASTO */

    if (maiorGasto) {

        relatorioMaiorGasto.textContent =
            formatarDinheiro(
                maiorGasto.valor
            );

        relatorioMaiorGastoNome.textContent =
            maiorGasto.descricao;

    } else {

        relatorioMaiorGasto.textContent =
            "R$ 0,00";

        relatorioMaiorGastoNome.textContent =
            "Nenhuma despesa";

    }

    atualizarComparacaoMes(
        despesasMes,
        despesasAnterior
    );

    atualizarGraficoBarras(
        receitasMes,
        despesasMes
    );

    atualizarCategorias(
        categorias,
        despesasMes
    );

    desenharGraficoSaldo();

}

/* =====================================================
   COMPARAÇÃO
===================================================== */

function atualizarComparacaoMes(
    atual,
    anterior
) {

    if (!textoComparacao) {

        return;

    }

    if (anterior <= 0) {

        textoComparacao.textContent =
            "Ainda não existem dados suficientes do mês anterior para fazer uma comparação.";

        return;

    }

    const diferenca =
        (
            (atual - anterior) /
            anterior
        ) * 100;

    if (diferenca < 0) {

        textoComparacao.textContent =
            "Neste mês você gastou " +
            Math.abs(diferenca).toFixed(1) +
            "% menos que no mês anterior.";

    } else if (diferenca > 0) {

        textoComparacao.textContent =
            "Neste mês você gastou " +
            diferenca.toFixed(1) +
            "% mais que no mês anterior.";

    } else {

        textoComparacao.textContent =
            "Seus gastos estão iguais aos do mês anterior.";

    }

}

/* =====================================================
   BARRAS
===================================================== */

function atualizarGraficoBarras(
    receitas,
    despesas
) {

    const maior =
        Math.max(
            receitas,
            despesas,
            1
        );

    if (barraReceitas) {

        barraReceitas.style.height =
            (
                receitas /
                maior *
                100
            ) +
            "%";

    }

    if (barraDespesas) {

        barraDespesas.style.height =
            (
                despesas /
                maior *
                100
            ) +
            "%";

    }

    if (valorBarraReceitas) {

        valorBarraReceitas.textContent =
            formatarDinheiro(
                receitas
            );

    }

    if (valorBarraDespesas) {

        valorBarraDespesas.textContent =
            formatarDinheiro(
                despesas
            );

    }

}

/* =====================================================
   CATEGORIAS
===================================================== */

function atualizarCategorias(
    categorias,
    totalDespesas
) {

    if (!listaCategorias) {

        return;

    }

    listaCategorias.innerHTML =
        "";

    const itens =
        Object.entries(
            categorias
        );

    itens.sort(
        function (a, b) {

            return b[1] - a[1];

        }
    );

    if (itens.length === 0) {

        listaCategorias.innerHTML = `

            <p class="lista-vazia">
                Nenhuma despesa cadastrada neste mês.
            </p>

        `;

        return;

    }

    itens.forEach(
        function (item) {

            const nome =
                item[0];

            const valor =
                item[1];

            const porcentagem =
                totalDespesas > 0

                    ? (
                        valor /
                        totalDespesas
                    ) * 100

                    : 0;

            const elemento =
                document.createElement(
                    "div"
                );

            elemento.classList.add(
                "categoria-item"
            );

            elemento.innerHTML = `

                <span class="categoria-nome">
                    ${nome}
                </span>

                <div class="categoria-barra">

                    <div
                        class="categoria-progresso"
                        style="
                            width:
                            ${porcentagem}%
                        "
                    >
                    </div>

                </div>

                <span class="categoria-valor">

                    ${formatarDinheiro(valor)}

                    • ${porcentagem.toFixed(0)}%

                </span>

            `;

            listaCategorias.appendChild(
                elemento
            );

        }
    );

}

/* =====================================================
   EVOLUÇÃO DO SALDO
===================================================== */

function desenharGraficoSaldo() {

    if (!graficoSaldo) {

        return;

    }

    const contexto =
        graficoSaldo.getContext(
            "2d"
        );

    contexto.clearRect(
        0,
        0,
        graficoSaldo.width,
        graficoSaldo.height
    );

    const movimentosOrdenados =
        [...movimentacoes]
            .filter(
                function (m) {

                    return m.data;

                }
            )
            .sort(
                function (a, b) {

                    return new Date(a.data) -
                        new Date(b.data);

                }
            );

    if (
        movimentosOrdenados.length === 0
    ) {

        contexto.fillStyle =
            "#ffffff";

        contexto.font =
            "14px Arial";

        contexto.fillText(
            "Ainda não existem dados suficientes.",
            30,
            50
        );

        return;

    }

    let saldo = 0;

    const pontos = [];

    movimentosOrdenados.forEach(
        function (movimentacao) {

            if (
                movimentacao.tipo ===
                "receita"
            ) {

                saldo +=
                    movimentacao.valor;

            } else {

                saldo -=
                    movimentacao.valor;

            }

            pontos.push(
                saldo
            );

        }
    );

    const maior =
        Math.max(
            ...pontos,
            1
        );

    const menor =
        Math.min(
            ...pontos,
            0
        );

    const intervalo =
        maior - menor || 1;

    const margem =
        35;

    contexto.strokeStyle =
        "#18351f";

    contexto.lineWidth =
        1;

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const y =
            margem +
            (
                i *
                (
                    graficoSaldo.height -
                    margem * 2
                ) /
                3
            );

        contexto.beginPath();

        contexto.moveTo(
            margem,
            y
        );

        contexto.lineTo(
            graficoSaldo.width -
            margem,
            y
        );

        contexto.stroke();

    }

    contexto.strokeStyle =
        "#267a3c";

    contexto.lineWidth =
        3;

    contexto.beginPath();

    pontos.forEach(
        function (
            valor,
            indice
        ) {

            const x =
                margem +
                (
                    indice *
                    (
                        graficoSaldo.width -
                        margem * 2
                    ) /
                    Math.max(
                        pontos.length - 1,
                        1
                    )
                );

            const y =
                graficoSaldo.height -
                margem -
                (
                    (
                        valor - menor
                    ) /
                    intervalo
                ) *
                (
                    graficoSaldo.height -
                    margem * 2
                );

            if (indice === 0) {

                contexto.moveTo(
                    x,
                    y
                );

            } else {

                contexto.lineTo(
                    x,
                    y
                );

            }

        }
    );

    contexto.stroke();

}

/* =====================================================
   INICIAR
===================================================== */

atualizarRelatorios();

/* =====================================================
   CHUVA DE DINHEIRO MONEYWISE
===================================================== */

const chuvaDinheiro =
    document.getElementById(
        "chuvaDinheiro"
    );

function criarNotaMoneyWise() {

    if (!chuvaDinheiro) {
        return;
    }

    const nota =
        document.createElement("div");

    nota.classList.add(
        "nota-moneywise"
    );

    const valores = [
        "R$",
        "R$ 10",
        "R$ 20",
        "R$ 50",
        "R$ 100"
    ];

    nota.textContent =
        valores[
            Math.floor(
                Math.random() * valores.length
            )
        ];

    nota.style.left =
        Math.random() * 95 + "vw";

    const duracao =
        7 + Math.random() * 6;

    nota.style.animationDuration =
        duracao + "s";

    chuvaDinheiro.appendChild(nota);

    setTimeout(
        function () {
            nota.remove();
        },
        duracao * 1000
    );
}

const intervaloNotasMoneyWise =
    window.innerWidth <= 600
        ? 3000
        : 1300;

setInterval(
    criarNotaMoneyWise,
    intervaloNotasMoneyWise
);

const quantidadeNotasIniciais =
    window.innerWidth <= 600
        ? 2
        : 4;

for (
    let i = 0;
    i < quantidadeNotasIniciais;
    i++
) {

    setTimeout(
        criarNotaMoneyWise,
        i * 450
    );

}

document.addEventListener(
    "visibilitychange",
    function () {

        if (document.hidden) {

            if (chuvaDinheiro) {
                chuvaDinheiro
                    .classList
                    .add("pausado");
            }

        } else {

            if (chuvaDinheiro) {
                chuvaDinheiro
                    .classList
                    .remove("pausado");
            }

        }

    }
);

/* =====================================================
   GRÁFICO VISUAL DO SALDO - 24 HORAS
===================================================== */

const graficoSaldo24h =
    document.getElementById(
        "graficoSaldo24h"
    );

const variacaoSaldo24h =
    document.getElementById(
        "variacaoSaldo24h"
    );

function desenharGraficoSaldo24h() {

    if (!graficoSaldo24h) {
        return;
    }

    const contexto =
        graficoSaldo24h.getContext(
            "2d"
        );

    /* TAMANHO REAL DO CANVAS */

    const largura =
        graficoSaldo24h.clientWidth;

    const altura =
        graficoSaldo24h.clientHeight;

const escala =
    Math.min(
        window.devicePixelRatio || 1,
        1.5
    );

    graficoSaldo24h.width =
        largura * escala;

    graficoSaldo24h.height =
        altura * escala;

    contexto.scale(
        escala,
        escala
    );

    contexto.clearRect(
        0,
        0,
        largura,
        altura
    );

    /* =========================
       LIMPAR REGISTROS ANTIGOS
    ========================= */

    const agora =
        Date.now();

    const limite =
        agora -
        (
            24 *
            60 *
            60 *
            1000
        );

    historicoSaldo24h =
        historicoSaldo24h.filter(
            function (registro) {

                return registro.horario >=
                    limite;

            }
        );

    /* =========================
       PRIMEIRO REGISTRO
    ========================= */

    if (
        historicoSaldo24h.length === 0
    ) {

        const resumo =
            calcularResumo();

        historicoSaldo24h.push({

            horario:
                agora,

            saldo:
                resumo.saldo

        });

        salvarHistoricoSaldo24h();

    }

    /* =========================
       DADOS
    ========================= */

    const dados =
        [...historicoSaldo24h]
            .sort(
                function (a, b) {

                    return (
                        a.horario -
                        b.horario
                    );

                }
            );

    /* =========================
       VARIAÇÃO DAS 24H
    ========================= */

    const saldoInicial =
        dados[0].saldo;

    const saldoAtual =
        dados[
            dados.length - 1
        ].saldo;

    const diferenca =
        saldoAtual -
        saldoInicial;

    if (variacaoSaldo24h) {

        variacaoSaldo24h.classList.remove(
            "variacao-24h-positiva",
            "variacao-24h-negativa",
            "variacao-24h-neutra"
        );

        if (diferenca > 0) {

            variacaoSaldo24h.textContent =
                "+" +
                formatarDinheiro(
                    diferenca
                );

            variacaoSaldo24h.classList.add(
                "variacao-24h-positiva"
            );

        } else if (diferenca < 0) {

            variacaoSaldo24h.textContent =
                formatarDinheiro(
                    diferenca
                );

            variacaoSaldo24h.classList.add(
                "variacao-24h-negativa"
            );

        } else {

            variacaoSaldo24h.textContent =
                "R$ 0,00";

            variacaoSaldo24h.classList.add(
                "variacao-24h-neutra"
            );

        }

    }

    /* =========================
       ESCALA
    ========================= */

    const valores =
        dados.map(
            function (registro) {

                return registro.saldo;

            }
        );

    let menorSaldo =
        Math.min(
            ...valores
        );

    let maiorSaldo =
        Math.max(
            ...valores
        );

    /* EVITA GRÁFICO TOTALMENTE RETO */

    if (menorSaldo === maiorSaldo) {

        menorSaldo -=
            Math.max(
                Math.abs(
                    menorSaldo * 0.05
                ),
                100
            );

        maiorSaldo +=
            Math.max(
                Math.abs(
                    maiorSaldo * 0.05
                ),
                100
            );

    }

    const margemX =
        20;

    const margemY =
        30;

    const areaLargura =
        largura -
        margemX * 2;

    const areaAltura =
        altura -
        margemY * 2;

    /* =========================
       LINHAS DO FUNDO
    ========================= */

    contexto.strokeStyle =
        "rgba(38, 122, 60, 0.25)";

    contexto.lineWidth =
        1;

    contexto.setLineDash(
        [4, 5]
    );

    for (
        let linha = 0;
        linha < 4;
        linha++
    ) {

        const y =
            margemY +
            (
                areaAltura /
                3
            ) *
            linha;

        contexto.beginPath();

        contexto.moveTo(
            margemX,
            y
        );

        contexto.lineTo(
            largura -
            margemX,
            y
        );

        contexto.stroke();

    }

    contexto.setLineDash(
        []
    );

    /* =========================
       FUNÇÃO PARA POSIÇÃO Y
    ========================= */

    function calcularY(
        saldo
    ) {

        return (
            margemY +
            (
                (
                    maiorSaldo -
                    saldo
                ) /
                (
                    maiorSaldo -
                    menorSaldo
                )
            ) *
            areaAltura
        );

    }

    /* =========================
       FUNÇÃO PARA POSIÇÃO X
    ========================= */

    function calcularX(
        horario
    ) {

        const progresso =
            (
                horario -
                limite
            ) /
            (
                agora -
                limite
            );

        return (
            margemX +
            progresso *
            areaLargura
        );

    }

    /* =========================
       DEGRADÊ ABAIXO DA LINHA
    ========================= */

    const gradiente =
        contexto.createLinearGradient(
            0,
            0,
            0,
            altura
        );

    gradiente.addColorStop(
        0,
        "rgba(38, 122, 60, 0.30)"
    );

    gradiente.addColorStop(
        1,
        "rgba(38, 122, 60, 0)"
    );

    contexto.beginPath();

    dados.forEach(
        function (
            registro,
            indice
        ) {

            const x =
                calcularX(
                    registro.horario
                );

            const y =
                calcularY(
                    registro.saldo
                );

            if (indice === 0) {

                contexto.moveTo(
                    x,
                    y
                );

            } else {

                contexto.lineTo(
                    x,
                    y
                );

            }

        }
    );

    const ultimo =
        dados[
            dados.length - 1
        ];

    const primeiro =
        dados[0];

    contexto.lineTo(
        calcularX(
            ultimo.horario
        ),
        altura -
        margemY
    );

    contexto.lineTo(
        calcularX(
            primeiro.horario
        ),
        altura -
        margemY
    );

    contexto.closePath();

    contexto.fillStyle =
        gradiente;

    contexto.fill();

    /* =========================
       LINHA PRINCIPAL
    ========================= */

    contexto.beginPath();

    dados.forEach(
        function (
            registro,
            indice
        ) {

            const x =
                calcularX(
                    registro.horario
                );

            const y =
                calcularY(
                    registro.saldo
                );

            if (indice === 0) {

                contexto.moveTo(
                    x,
                    y
                );

            } else {

                contexto.lineTo(
                    x,
                    y
                );

            }

        }
    );

    contexto.strokeStyle =
        "#267a3c";

    contexto.lineWidth =
        3;

    contexto.lineJoin =
        "round";

    contexto.lineCap =
        "round";

    contexto.stroke();

    /* =========================
       PONTOS
    ========================= */

    dados.forEach(
        function (registro) {

            const x =
                calcularX(
                    registro.horario
                );

            const y =
                calcularY(
                    registro.saldo
                );

            contexto.beginPath();

            contexto.arc(
                x,
                y,
                4,
                0,
                Math.PI * 2
            );

            contexto.fillStyle =
                "#267a3c";

            contexto.fill();

            contexto.beginPath();

            contexto.arc(
                x,
                y,
                8,
                0,
                Math.PI * 2
            );

            contexto.strokeStyle =
                "rgba(38, 122, 60, 0.30)";

            contexto.lineWidth =
                3;

            contexto.stroke();

        }
    );

}

desenharGraficoSaldo24h();

/* REDESENHA QUANDO MUDA
   O TAMANHO DA TELA */

window.addEventListener(
    "resize",
    desenharGraficoSaldo24h
);

/* =====================================================

/* MONEYWISE — PARTE 4 DE 4
   Trecho original: linhas 4231–5116.
   Cole esta parte inteira e depois a próxima logo abaixo.
   
*/
/* ====================================================
   MERCADO BITCOIN - HISTÓRICO REAL 24H
===================================================== */

const btcMercadoCanvas =
    document.getElementById("btcMercadoCanvas");

const btcMercadoPreco =
    document.getElementById("btcMercadoPreco");

const btcMercadoVariacao =
    document.getElementById("btcMercadoVariacao");

const btcTooltip =
    document.getElementById("btcTooltip");

let btcMercadoDados = [];

async function carregarMercadoBitcoin() {

    if (!btcMercadoCanvas) {
        return;
    }

    try {

        const resposta = await fetch(
            "https://economia.awesomeapi.com.br/json/daily/BTC-BRL/30"
        );

        if (!resposta.ok) {
            throw new Error(
                "Erro HTTP: " + resposta.status
            );
        }

        const dados = await resposta.json();

        if (
            !Array.isArray(dados) ||
            dados.length < 2
        ) {
            throw new Error(
                "Histórico do Bitcoin não recebido"
            );
        }

        btcMercadoDados = dados
            .map(function (ponto) {

                return {
                    horario:
                        Number(ponto.timestamp) * 1000,

                    valor:
                        Number(ponto.bid)
                };

            })
            .filter(function (ponto) {

                return (
                    Number.isFinite(ponto.horario) &&
                    Number.isFinite(ponto.valor)
                );

            })
            .sort(function (a, b) {

                return a.horario - b.horario;

            });

        if (btcMercadoDados.length < 2) {
            throw new Error(
                "Dados insuficientes para o gráfico"
            );
        }

        desenharMercadoBitcoin();

    } catch (erro) {

        console.error(
            "Erro mercado Bitcoin:",
            erro
        );

        if (btcMercadoPreco) {
            btcMercadoPreco.textContent =
                "Indisponível";
        }

        if (btcMercadoVariacao) {
            btcMercadoVariacao.textContent =
                "Não foi possível carregar o mercado";
        }

    }

}

/* =====================================================
   FORMATAR PREÇO
===================================================== */

function formatarPrecoMercadoBTC(valor) {

    return valor.toLocaleString(
        "pt-BR",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}

/* =====================================================
   DESENHAR GRÁFICO
===================================================== */

function desenharMercadoBitcoin() {

    if (
        !btcMercadoCanvas ||
        btcMercadoDados.length < 2
    ) {
        return;
    }

    const ctx =
        btcMercadoCanvas.getContext("2d");

    const largura =
        btcMercadoCanvas.clientWidth;

    const altura =
        btcMercadoCanvas.clientHeight;

const escala =
    Math.min(
        window.devicePixelRatio || 1,
        1.5
    );

    btcMercadoCanvas.width =
        largura * escala;

    btcMercadoCanvas.height =
        altura * escala;

    ctx.setTransform(
        escala,
        0,
        0,
        escala,
        0,
        0
    );

    ctx.clearRect(
        0,
        0,
        largura,
        altura
    );

    const valores =
        btcMercadoDados.map(
            ponto => ponto.valor
        );

    const primeiro =
        btcMercadoDados[0].valor;

    const ultimo =
        btcMercadoDados[
            btcMercadoDados.length - 1
        ].valor;

    let minimo =
        Math.min(...valores);

    let maximo =
        Math.max(...valores);

    const diferenca =
        maximo - minimo;

    const folga =
        diferenca * 0.10 || 100;

    minimo -= folga;
    maximo += folga;

    /* PREÇO */

    if (btcMercadoPreco) {

        btcMercadoPreco.textContent =
            formatarPrecoMercadoBTC(
                ultimo
            );

    }

    /* VARIAÇÃO */

    const mudanca =
        ultimo - primeiro;

    const porcentagem =
        (mudanca / primeiro) * 100;

    if (btcMercadoVariacao) {

        const sinal =
            mudanca >= 0
                ? "+"
                : "";

        btcMercadoVariacao.textContent =
            sinal +
            formatarPrecoMercadoBTC(
                mudanca
            ) +
            " (" +
            sinal +
            porcentagem
                .toFixed(2)
                .replace(".", ",") +
            "%) hoje";

        btcMercadoVariacao.classList.remove(
            "btc-positivo",
            "btc-negativo"
        );

        btcMercadoVariacao.classList.add(
            mudanca >= 0
                ? "btc-positivo"
                : "btc-negativo"
        );

    }

    /* MARGENS */

    const esquerda = 75;
    const direita = 20;
    const topo = 20;
    const baixo = 35;

    const larguraGrafico =
        largura -
        esquerda -
        direita;

    const alturaGrafico =
        altura -
        topo -
        baixo;

    /* POSIÇÕES */

    function xPonto(indice) {

        return (
            esquerda +
            (
                indice /
                (
                    btcMercadoDados.length -
                    1
                )
            ) *
            larguraGrafico
        );

    }

    function yPonto(valor) {

        return (
            topo +
            (
                (maximo - valor) /
                (maximo - minimo)
            ) *
            alturaGrafico
        );

    }

    /* GRID */

    ctx.font =
        "11px Arial";

    ctx.textBaseline =
        "middle";

    ctx.textAlign =
        "right";

    for (
        let linha = 0;
        linha < 5;
        linha++
    ) {

        const proporcao =
            linha / 4;

        const y =
            topo +
            proporcao *
            alturaGrafico;

        const valor =
            maximo -
            proporcao *
            (
                maximo -
                minimo
            );

        ctx.beginPath();

        ctx.strokeStyle =
            "rgba(255,255,255,0.10)";

        ctx.lineWidth = 1;

        ctx.moveTo(
            esquerda,
            y
        );

        ctx.lineTo(
            largura - direita,
            y
        );

        ctx.stroke();

        ctx.fillStyle =
            "#a0a0a0";

        ctx.fillText(
            Math.round(valor)
                .toLocaleString("pt-BR"),
            esquerda - 10,
            y
        );

    }

    /* COR DO DIA */

    const positivo =
        ultimo >= primeiro;

    const cor =
        positivo
            ? "#2fa84f"
            : "#ff746a";

    /* ÁREA */

    const gradiente =
        ctx.createLinearGradient(
            0,
            topo,
            0,
            altura - baixo
        );

    if (positivo) {

        gradiente.addColorStop(
            0,
            "rgba(47,168,79,0.22)"
        );

        gradiente.addColorStop(
            1,
            "rgba(47,168,79,0)"
        );

    } else {

        gradiente.addColorStop(
            0,
            "rgba(255,116,106,0.22)"
        );

        gradiente.addColorStop(
            1,
            "rgba(255,116,106,0)"
        );

    }

    ctx.beginPath();

    btcMercadoDados.forEach(
        function (ponto, indice) {

            const x =
                xPonto(indice);

            const y =
                yPonto(ponto.valor);

            if (indice === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

        }
    );

    ctx.lineTo(
        xPonto(
            btcMercadoDados.length - 1
        ),
        altura - baixo
    );

    ctx.lineTo(
        xPonto(0),
        altura - baixo
    );

    ctx.closePath();

    ctx.fillStyle =
        gradiente;

    ctx.fill();

    /* LINHA */

    ctx.beginPath();

    btcMercadoDados.forEach(
        function (ponto, indice) {

            const x =
                xPonto(indice);

            const y =
                yPonto(ponto.valor);

            if (indice === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

        }
    );

    ctx.strokeStyle =
        cor;

    ctx.lineWidth =
        2;

    ctx.lineJoin =
        "round";

    ctx.lineCap =
        "round";

    ctx.stroke();

    /* HORÁRIOS */

    const posicoes =
        [0, 0.33, 0.66, 1];

    const ids =
        [
            "btcHora1",
            "btcHora2",
            "btcHora3",
            "btcHora4"
        ];

    posicoes.forEach(
        function (posicao, i) {

            const indice =
                Math.floor(
                    posicao *
                    (
                        btcMercadoDados.length -
                        1
                    )
                );

            const data =
                new Date(
                    btcMercadoDados[
                        indice
                    ].horario
                );

            const elemento =
                document.getElementById(
                    ids[i]
                );

            if (elemento) {

                elemento.textContent =
                    data.toLocaleTimeString(
                        "pt-BR",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    );

            }

        }
    );

}

/* =====================================================
   TOOLTIP IGUAL GRÁFICO DE MERCADO
===================================================== */

if (btcMercadoCanvas) {

    btcMercadoCanvas.addEventListener(
        "mousemove",
        function (evento) {

            if (
                btcMercadoDados.length === 0
            ) {
                return;
            }

            const rect =
                btcMercadoCanvas
                    .getBoundingClientRect();

            const mouseX =
                evento.clientX -
                rect.left;

            const esquerda =
                75;

            const direita =
                20;

            const larguraGrafico =
                rect.width -
                esquerda -
                direita;

            let porcentagem =
                (
                    mouseX -
                    esquerda
                ) /
                larguraGrafico;

            porcentagem =
                Math.max(
                    0,
                    Math.min(
                        1,
                        porcentagem
                    )
                );

            const indice =
                Math.round(
                    porcentagem *
                    (
                        btcMercadoDados.length -
                        1
                    )
                );

            const ponto =
                btcMercadoDados[
                    indice
                ];

            const data =
                new Date(
                    ponto.horario
                );

            if (btcTooltip) {

                btcTooltip.innerHTML =
                    "<strong>" +
                    formatarPrecoMercadoBTC(
                        ponto.valor
                    ) +
                    "</strong>" +
                    "<span>" +
                    data.toLocaleTimeString(
                        "pt-BR",
                        {
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    ) +
                    "</span>";

                btcTooltip.style.display =
                    "flex";

                btcTooltip.style.left =
                    mouseX + "px";

            }

        }
    );

    btcMercadoCanvas.addEventListener(
        "mouseleave",
        function () {

            if (btcTooltip) {
                btcTooltip.style.display =
                    "none";
            }

        }
    );

}

carregarMercadoBitcoin();

const intervaloMercadoBitcoin =
    window.innerWidth <= 600
        ? 60000
        : 30000;

setInterval(
    carregarMercadoBitcoin,
    intervaloMercadoBitcoin
);

window.addEventListener(
    "resize",
    desenharMercadoBitcoin
);
/* =========================================
   MENU MOBILE MONEYWISE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const botao =
        document.getElementById("menuMobileBotao");

    const menu =
        document.querySelector("header nav");

    if (!botao || !menu) {
        return;
    }

    /* GARANTE QUE A PÁGINA SEMPRE INICIE FECHADA */

    menu.classList.remove("menu-mobile-aberto");
    botao.classList.remove("ativo");
    document.body.classList.remove("menu-aberto");

    botao.setAttribute(
        "aria-expanded",
        "false"
    );

    /* FUNÇÃO PARA ABRIR */

    function abrirMenu() {

        menu.classList.add(
            "menu-mobile-aberto"
        );

        botao.classList.add(
            "ativo"
        );

        document.body.classList.add(
            "menu-aberto"
        );

        botao.setAttribute(
            "aria-expanded",
            "true"
        );

        botao.setAttribute(
            "aria-label",
            "Fechar menu"
        );

    }

    /* FUNÇÃO PARA FECHAR */

    function fecharMenu() {

        menu.classList.remove(
            "menu-mobile-aberto"
        );

        botao.classList.remove(
            "ativo"
        );

        document.body.classList.remove(
            "menu-aberto"
        );

        botao.setAttribute(
            "aria-expanded",
            "false"
        );

        botao.setAttribute(
            "aria-label",
            "Abrir menu"
        );

    }

    /* BOTÃO ☰ / X */

    botao.addEventListener(
        "click",
        function () {

            if (
                menu.classList.contains(
                    "menu-mobile-aberto"
                )
            ) {

                fecharMenu();

            } else {

                abrirMenu();

            }

        }
    );

    /* FECHA AO CLICAR NOS LINKS */

    const links =
        menu.querySelectorAll("a");

    links.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                fecharMenu();

            }
        );

    });

    /* ESC */

    document.addEventListener(
        "keydown",
        function (evento) {

            if (evento.key === "Escape") {
                fecharMenu();
            }

        }
    );

    /* VOLTOU PARA DESKTOP */

    window.addEventListener(
        "resize",
        function () {

            if (window.innerWidth > 850) {
                fecharMenu();
            }

        }
    );

    /* CORRIGE VOLTAR/AVANÇAR DO NAVEGADOR */

    window.addEventListener(
        "pageshow",
        function () {

            fecharMenu();

        }
    );

});


/* =====================================================
   LIMITE DE GASTOS DIÁRIOS
===================================================== */

let limiteDiarioMoneyWise =
    Number(
        localStorage.getItem(
            "limiteDiarioMoneyWise"
        )
    ) || 0;


/* RENDA DO MÊS */

function calcularRendaMesLimite() {

    const agora =
        new Date();

    const ano =
        agora.getFullYear();

    const mes =
        String(
            agora.getMonth() + 1
        ).padStart(2, "0");

    const mesAtual =
        `${ano}-${mes}`;

    let renda =
        0;

    movimentacoes.forEach(
        function (movimentacao) {

            if (
                movimentacao.tipo ===
                "receita" &&

                movimentacao.data &&
                movimentacao.data.substring(
                    0,
                    7
                ) === mesAtual
            ) {

                renda +=
                    Number(
                        movimentacao.valor
                    ) || 0;

            }

        }
    );

    return renda;
}


/* LIMITE MÁXIMO */

function calcularMaximoLimiteDiario() {

    const renda =
        calcularRendaMesLimite();

    /*
       1% da renda mensal por dia.
       Exemplo:
       R$ 3.000 = R$ 30 por dia.
    */

    return renda * 0.05;
}


/* GASTOS DO DIA */

function calcularGastoHojeLimite() {

    const hoje =
        new Date()
            .toISOString()
            .split("T")[0];

    let gasto =
        0;

    movimentacoes.forEach(
        function (movimentacao) {

            if (
                movimentacao.tipo ===
                "despesa" &&

                movimentacao.data ===
                hoje
            ) {

                gasto +=
                    Number(
                        movimentacao.valor
                    ) || 0;

            }

        }
    );

    return gasto;
}


/* ATUALIZA A TELA */

function atualizarLimiteDiario() {

    const input =
        document.getElementById(
            "limiteDiarioInput"
        );

    const rendaElemento =
        document.getElementById(
            "rendaMesLimite"
        );

    const maximoElemento =
        document.getElementById(
            "limiteMaximoDiario"
        );

    const gastoElemento =
        document.getElementById(
            "gastoHojeLimite"
        );

    const restanteElemento =
        document.getElementById(
            "restanteHojeLimite"
        );

    const progresso =
        document.getElementById(
            "progressoLimiteDiario"
        );

    const mensagem =
        document.getElementById(
            "mensagemLimiteDiario"
        );

    if (
        !rendaElemento ||
        !maximoElemento ||
        !gastoElemento ||
        !restanteElemento ||
        !progresso ||
        !mensagem
    ) {
        return;
    }


    const renda =
        calcularRendaMesLimite();

    const maximo =
        calcularMaximoLimiteDiario();

    const gastoHoje =
        calcularGastoHojeLimite();


    /* CORRIGE LIMITE SALVO ACIMA DO MÁXIMO */

    if (
        maximo > 0 &&
        limiteDiarioMoneyWise > maximo
    ) {

        limiteDiarioMoneyWise =
            maximo;

        localStorage.setItem(
            "limiteDiarioMoneyWise",
            String(
                limiteDiarioMoneyWise
            )
        );

    }


    rendaElemento.textContent =
        formatarDinheiro(
            renda
        );

    maximoElemento.textContent =
        formatarDinheiro(
            maximo
        );

    gastoElemento.textContent =
        formatarDinheiro(
            gastoHoje
        );


    if (input) {

        input.value =
            limiteDiarioMoneyWise > 0
                ? limiteDiarioMoneyWise
                : "";

    }


    /* SEM RENDA */

    if (renda <= 0) {

        restanteElemento.textContent =
            "R$ 0,00";

        progresso.style.width =
            "0%";

        progresso.classList.remove(
            "limite-diario-atencao",
            "limite-diario-estourado"
        );

        mensagem.textContent =
            "Registre uma receita neste mês para calcular seu limite diário.";

        return;
    }


    /* SEM LIMITE */

    if (
        limiteDiarioMoneyWise <= 0
    ) {

        restanteElemento.textContent =
            "R$ 0,00";

        progresso.style.width =
            "0%";

        mensagem.textContent =
            "Defina seu limite diário para começar o controle.";

        return;
    }


    const restante =
        limiteDiarioMoneyWise -
        gastoHoje;


    restanteElemento.textContent =
        formatarDinheiro(
            Math.max(
                restante,
                0
            )
        );


    const porcentagem =
        (
            gastoHoje /
            limiteDiarioMoneyWise
        ) * 100;


    progresso.style.width =
        Math.min(
            porcentagem,
            100
        ) + "%";


    progresso.classList.remove(
        "limite-diario-atencao",
        "limite-diario-estourado"
    );


    /* ESTOUROU */

    if (
        gastoHoje >=
        limiteDiarioMoneyWise
    ) {

        progresso.classList.add(
            "limite-diario-estourado"
        );

        mensagem.textContent =
            "Você atingiu o limite de gastos de hoje.";

        return;
    }


    /* 80% */

    if (
        porcentagem >= 80
    ) {

        progresso.classList.add(
            "limite-diario-atencao"
        );

        mensagem.textContent =
            "Atenção: você já utilizou mais de 80% do limite de hoje.";

        return;
    }


    mensagem.textContent =
        "Seus gastos de hoje estão dentro do limite.";

}


/* SALVAR LIMITE */

function salvarLimiteDiarioMoneyWise() {

    const input =
        document.getElementById(
            "limiteDiarioInput"
        );

    if (!input) {
        return;
    }


    const valor =
        Number(
            input.value
        );

    const maximo =
        calcularMaximoLimiteDiario();


    if (
        maximo <= 0
    ) {

        mostrarMensagemMoneyWise(
            "Renda necessária",
            "Registre uma receita neste mês antes de definir seu limite diário.",
            "ATENÇÃO"
        );

        return;
    }


    if (
        !Number.isFinite(valor) ||
        valor <= 0
    ) {

        mostrarMensagemMoneyWise(
            "Valor inválido",
            "Digite um limite diário maior que zero.",
            "ATENÇÃO"
        );

        return;
    }


    if (
        valor > maximo
    ) {

        mostrarMensagemMoneyWise(
            "Limite muito alto",
            "O limite diário não pode ultrapassar " +
            formatarDinheiro(maximo) +
            " com base na sua renda deste mês.",
            "ATENÇÃO"
        );

        return;
    }


    limiteDiarioMoneyWise =
        valor;


    localStorage.setItem(
        "limiteDiarioMoneyWise",
        String(
            limiteDiarioMoneyWise
        )
    );


    atualizarLimiteDiario();


    mostrarMensagemMoneyWise(
        "Limite salvo!",
        "Seu limite diário foi atualizado com sucesso.",
        "SUCESSO"
    );

}


/* VERIFICA SE UMA DESPESA PODE SER ADICIONADA */

function verificarLimiteAntesDaDespesa() {

    if (
        !tipoInput ||
        tipoInput.value !==
        "despesa"
    ) {
        return true;
    }


    if (
        limiteDiarioMoneyWise <= 0
    ) {
        return true;
    }


    const hoje =
        new Date()
            .toISOString()
            .split("T")[0];


    const dataSelecionada =
        dataMovimentacaoInput &&
        dataMovimentacaoInput.value
            ? dataMovimentacaoInput.value
            : hoje;


    /* SÓ BLOQUEIA A DATA DE HOJE */

    if (
        dataSelecionada !==
        hoje
    ) {
        return true;
    }


    const gastoHoje =
        calcularGastoHojeLimite();


    const valor =
        Number(
            valorInput.value
        ) || 0;


    if (
        gastoHoje +
        valor >
        limiteDiarioMoneyWise
    ) {

        const restante =
            Math.max(
                limiteDiarioMoneyWise -
                gastoHoje,
                0
            );


        mostrarMensagemMoneyWise(
            "Limite diário ultrapassado",
            "Você ainda pode gastar " +
            formatarDinheiro(restante) +
            " hoje.",
            "ATENÇÃO"
        );


        return false;
    }


    return true;

}


/* BOTÃO SALVAR */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const botao =
            document.getElementById(
                "salvarLimiteDiario"
            );


        if (botao) {

            botao.addEventListener(
                "click",
                salvarLimiteDiarioMoneyWise
            );

        }


        atualizarLimiteDiario();

    }
);


/* ATUALIZA QUANDO A MOVIMENTAÇÃO É ALTERADA */

setInterval(
    atualizarLimiteDiario,
    1000
);


/* BLOQUEIA DESPESA PELO BOTÃO */

if (adicionarBtn) {

    adicionarBtn.addEventListener(
        "click",
        function (event) {

            if (
                !verificarLimiteAntesDaDespesa()
            ) {

                event.preventDefault();

                event.stopImmediatePropagation();

            }

        },
        true
    );

}


/* BLOQUEIA DESPESA AO APERTAR ENTER */

if (valorInput) {

    valorInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !verificarLimiteAntesDaDespesa()
            ) {

                event.preventDefault();

                event.stopImmediatePropagation();

            }

        },
        true
    );

}