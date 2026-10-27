document.addEventListener("DOMContentLoaded", function () {
    "use strict";
    const CHAVE_MOVIMENTACOES = "movimentacoesMoneyWise";
const CHAVE_USUARIO = "usuarioMoneyWise";

const elementos = {
    foto: document.getElementById("fotoConta"),
    nome: document.getElementById("nomeConta"),
    email: document.getElementById("emailConta"),

    saldo: document.getElementById("saldoConta"),
    receitas: document.getElementById("receitasConta"),
    despesas: document.getElementById("despesasConta"),
    quantidade: document.getElementById("quantidadeConta"),

    mesAno: document.getElementById("mesAnoCalendario"),
    dias: document.getElementById("diasCalendario"),
    mesAnterior: document.getElementById("mesAnterior"),
    proximoMes: document.getElementById("proximoMes"),

    tituloDia: document.getElementById("tituloDiaSelecionado"),
    resumoDia: document.getElementById("resumoDiaSelecionado"),
    receitasDia: document.getElementById("receitasDia"),
    despesasDia: document.getElementById("despesasDia"),
    listaDia: document.getElementById("listaMovimentacoesDia"),

    historico: document.getElementById("historicoMensalConta")
};

let movimentacoes = carregarMovimentacoes();
let dataAtual = new Date();
let mesExibido = new Date(
    dataAtual.getFullYear(),
    dataAtual.getMonth(),
    1
);

let dataSelecionada = obterDataLocal(dataAtual);

function obterDataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function carregarMovimentacoes() {
    try {
        const dados = JSON.parse(
            localStorage.getItem(CHAVE_MOVIMENTACOES)
        );

        return Array.isArray(dados) ? dados : [];
    } catch (erro) {
        console.error("Erro ao carregar movimentações:", erro);
        return [];
    }
}

function carregarUsuario() {
    let usuario = {};

    try {
        usuario = JSON.parse(
            localStorage.getItem(CHAVE_USUARIO)
        ) || {};
    } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
    }

    if (elementos.nome) {
        elementos.nome.textContent =
            usuario.nome || "Usuário MoneyWise";
    }

    if (elementos.email) {
        elementos.email.textContent =
            usuario.email || "Conta pessoal";
    }

    if (elementos.foto && usuario.foto) {
        elementos.foto.src = usuario.foto;
    }

    if (elementos.foto) {
        elementos.foto.addEventListener("error", function () {
            this.src = "img/favicon.png";
        });
    }
}

function formatarDinheiro(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function obterValor(movimentacao) {
    const valor = Number(movimentacao.valor);
    return Number.isFinite(valor) ? valor : 0;
}

function obterData(movimentacao) {
    if (!movimentacao.data) {
        return "";
    }

    const texto = String(movimentacao.data);

    if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return texto;
    }

    const correspondencia = texto.match(
        /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (correspondencia) {
        return `${correspondencia[3]}-${correspondencia[2]}-${correspondencia[1]}`;
    }

    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) {
        return "";
    }

    return obterDataLocal(data);
}

function mesmaData(movimentacao, data) {
    return obterData(movimentacao) === data;
}

function mesmoMes(movimentacao, ano, mes) {
    const data = obterData(movimentacao);

    if (!data) {
        return false;
    }

    const partes = data.split("-");

    return Number(partes[0]) === ano &&
        Number(partes[1]) === mes + 1;
}

function calcularResumo(lista) {
    let receitas = 0;
    let despesas = 0;

    lista.forEach(function (movimentacao) {
        const valor = obterValor(movimentacao);

        if (movimentacao.tipo === "receita") {
            receitas += valor;
        } else if (movimentacao.tipo === "despesa") {
            despesas += valor;
        }
    });

    return {
        receitas,
        despesas,
        saldo: receitas - despesas
    };
}

function atualizarResumo() {
    const resumoTotal = calcularResumo(movimentacoes);

    const movimentacoesMes = movimentacoes.filter(function (movimentacao) {
        return mesmoMes(
            movimentacao,
            mesExibido.getFullYear(),
            mesExibido.getMonth()
        );
    });

    const resumoMes = calcularResumo(movimentacoesMes);

    if (elementos.saldo) {
        elementos.saldo.textContent =
            formatarDinheiro(resumoTotal.saldo);
    }

    if (elementos.receitas) {
        elementos.receitas.textContent =
            formatarDinheiro(resumoMes.receitas);
    }

    if (elementos.despesas) {
        elementos.despesas.textContent =
            formatarDinheiro(resumoMes.despesas);
    }

    if (elementos.quantidade) {
        elementos.quantidade.textContent =
            movimentacoesMes.length.toLocaleString("pt-BR");
    }
}

function obterNomeMes(data) {
    return data.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });
}

function desenharCalendario() {
    if (!elementos.dias || !elementos.mesAno) {
        return;
    }

    elementos.dias.innerHTML = "";

    const ano = mesExibido.getFullYear();
    const mes = mesExibido.getMonth();

    elementos.mesAno.textContent = obterNomeMes(mesExibido);

    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaSemana; i++) {
        const vazio = document.createElement("div");
        vazio.className = "dia-calendario vazio";
        vazio.setAttribute("aria-hidden", "true");
        elementos.dias.appendChild(vazio);
    }

    for (let dia = 1; dia <= totalDias; dia++) {
        const data = obterDataLocal(new Date(ano, mes, dia));

        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "dia-calendario";
        botao.textContent = dia;
        botao.setAttribute("aria-label", `${dia} de ${obterNomeMes(mesExibido)}`);

        const movimentacoesDia = movimentacoes.filter(function (movimentacao) {
            return mesmaData(movimentacao, data);
        });

        const temReceita = movimentacoesDia.some(function (movimentacao) {
            return movimentacao.tipo === "receita";
        });

        const temDespesa = movimentacoesDia.some(function (movimentacao) {
            return movimentacao.tipo === "despesa";
        });

        if (temReceita) {
            botao.classList.add("tem-receita");
        }

        if (temDespesa) {
            botao.classList.add("tem-despesa");
        }

        if (data === obterDataLocal(new Date())) {
            botao.classList.add("hoje");
        }

        if (data === dataSelecionada) {
            botao.classList.add("selecionado");
            botao.setAttribute("aria-pressed", "true");
        } else {
            botao.setAttribute("aria-pressed", "false");
        }

        botao.addEventListener("click", function () {
            dataSelecionada = data;
            desenharCalendario();
            atualizarDetalhesDia();
        });

        elementos.dias.appendChild(botao);
    }
}

function formatarDataCompleta(dataTexto) {
    const partes = dataTexto.split("-");

    if (partes.length !== 3) {
        return "Data não informada";
    }

    const data = new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

    return data.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function atualizarDetalhesDia() {
    if (!elementos.listaDia) {
        return;
    }

    const lista = movimentacoes.filter(function (movimentacao) {
        return mesmaData(movimentacao, dataSelecionada);
    });

    const resumo = calcularResumo(lista);

    if (elementos.tituloDia) {
        elementos.tituloDia.textContent =
            formatarDataCompleta(dataSelecionada);
    }

    if (elementos.resumoDia) {
        elementos.resumoDia.textContent =
            `${lista.length} movimentação(ões) registrada(s) neste dia.`;
    }

    if (elementos.receitasDia) {
        elementos.receitasDia.textContent =
            formatarDinheiro(resumo.receitas);
    }

    if (elementos.despesasDia) {
        elementos.despesasDia.textContent =
            formatarDinheiro(resumo.despesas);
    }

    elementos.listaDia.innerHTML = "";

    if (lista.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "estado-vazio";
        vazio.textContent = "Nenhuma movimentação registrada nesta data.";
        elementos.listaDia.appendChild(vazio);
        return;
    }

    lista.forEach(function (movimentacao) {
        const item = document.createElement("div");
        item.className = "movimentacao-conta";

        const informacoes = document.createElement("div");
        informacoes.className = "movimentacao-conta-info";

        const descricao = document.createElement("strong");
        descricao.textContent =
            movimentacao.descricao || "Movimentação";

        const categoria = document.createElement("span");
        categoria.textContent =
            movimentacao.categoria || "Sem categoria";

        const valor = document.createElement("strong");
        valor.className = "movimentacao-conta-valor";

        if (movimentacao.tipo === "receita") {
            valor.classList.add("valor-receita");
            valor.textContent = `+ ${formatarDinheiro(obterValor(movimentacao))}`;
        } else {
            valor.classList.add("valor-despesa");
            valor.textContent = `- ${formatarDinheiro(obterValor(movimentacao))}`;
        }

        informacoes.appendChild(descricao);
        informacoes.appendChild(categoria);

        item.appendChild(informacoes);
        item.appendChild(valor);

        elementos.listaDia.appendChild(item);
    });
}

function atualizarHistoricoMensal() {
    if (!elementos.historico) {
        return;
    }

    const lista = movimentacoes
        .filter(function (movimentacao) {
            return mesmoMes(
                movimentacao,
                mesExibido.getFullYear(),
                mesExibido.getMonth()
            );
        })
        .sort(function (a, b) {
            return obterData(b).localeCompare(obterData(a));
        });

    elementos.historico.innerHTML = "";

    if (lista.length === 0) {
        const vazio = document.createElement("p");
        vazio.className = "estado-vazio";
        vazio.textContent = "Nenhuma movimentação registrada neste mês.";
        elementos.historico.appendChild(vazio);
        return;
    }

    lista.forEach(function (movimentacao) {
        const item = document.createElement("div");
        item.className = "historico-mes-item";

        const descricao = document.createElement("div");
        descricao.className = "historico-mes-descricao";

        const titulo = document.createElement("strong");
        titulo.textContent =
            movimentacao.descricao || "Movimentação";

        const detalhe = document.createElement("span");
        detalhe.textContent =
            `${formatarDataCompleta(obterData(movimentacao))} · ${movimentacao.categoria || "Sem categoria"}`;

        const tipo = document.createElement("span");
        tipo.textContent =
            movimentacao.tipo === "receita" ? "Receita" : "Despesa";

        const valor = document.createElement("strong");

        if (movimentacao.tipo === "receita") {
            valor.className = "valor-receita";
            valor.textContent = `+ ${formatarDinheiro(obterValor(movimentacao))}`;
        } else {
            valor.className = "valor-despesa";
            valor.textContent = `- ${formatarDinheiro(obterValor(movimentacao))}`;
        }

        descricao.appendChild(titulo);
        descricao.appendChild(detalhe);

        item.appendChild(descricao);
        item.appendChild(tipo);
        item.appendChild(valor);

        elementos.historico.appendChild(item);
    });
}

function atualizarPagina() {
    atualizarResumo();
    desenharCalendario();
    atualizarDetalhesDia();
    atualizarHistoricoMensal();
}

if (elementos.mesAnterior) {
    elementos.mesAnterior.addEventListener("click", function () {
        mesExibido = new Date(
            mesExibido.getFullYear(),
            mesExibido.getMonth() - 1,
            1
        );

        dataSelecionada = obterDataLocal(mesExibido);
        atualizarPagina();
    });
}

if (elementos.proximoMes) {
    elementos.proximoMes.addEventListener("click", function () {
        mesExibido = new Date(
            mesExibido.getFullYear(),
            mesExibido.getMonth() + 1,
            1
        );

        dataSelecionada = obterDataLocal(mesExibido);
        atualizarPagina();
    });
}

/*
 * O Firebase chama esta função quando termina de carregar
 * as movimentações salvas na conta do usuário.
 */
window.receberMovimentacoesFirestore = function (dados) {
    if (!Array.isArray(dados)) {
        return;
    }

    movimentacoes = dados;

    try {
        localStorage.setItem(
            CHAVE_MOVIMENTACOES,
            JSON.stringify(movimentacoes)
        );
    } catch (erro) {
        console.error("Erro ao atualizar movimentações locais:", erro);
    }

    atualizarPagina();
};

/*
 * Atualiza a tela se outra página do MoneyWise alterar
 * os dados no mesmo navegador.
 */
window.addEventListener("storage", function (evento) {
    if (evento.key === CHAVE_MOVIMENTACOES) {
        movimentacoes = carregarMovimentacoes();
        atualizarPagina();
    }

    if (evento.key === CHAVE_USUARIO) {
        carregarUsuario();
    }
});

carregarUsuario();
atualizarPagina();

console.log("Página Minha Conta inicializada.");
});