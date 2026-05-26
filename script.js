// Configurações do Jogo
let turnoEstacao = 1;
const turnosParaMudar = 10; 
const estacoes = ["Primavera", "Verão", "Outono", "Inverno"];
let indiceEstacao = 0;

const climas = ["Ensolarado", "Nublado", "Chuvoso"];
let climaAtual = "Ensolarado";

let estagioPlantio = "Preparado"; 
let insumoAplicado = false;
let jaPerdeuTempoInsumo = false; 

// Elementos do HTML
const txtEstacao = document.getElementById("txt-estacao");
const txtTurno = document.getElementById("txt-turno");
const txtClima = document.getElementById("txt-clima");
const txtEstagio = document.getElementById("txt-estagio");
const txtInsumo = document.getElementById("txt-insumo");
const telaCampo = document.getElementById("tela-campo");
const caixaLogs = document.getElementById("caixa-logs");

function atualizarInterface() {
    txtEstacao.innerText = estacoes[indiceEstacao];
    txtTurno.innerText = turnoEstacao;
    txtClima.innerText = climaAtual;
    
    if (estagioPlantio === "Preparado") txtEstagio.innerText = "Preparado para Plantar";
    if (estagioPlantio === "Crescimento") txtEstagio.innerText = "Em Crescimento (Janela de Insumos Aberta!)";
    if (estagioPlantio === "Pronto") txtEstagio.innerText = "Pronto para Colheita";

    txtInsumo.innerText = insumoAplicado ? "Sim (Protegido/Nutrido)" : (jaPerdeuTempoInsumo ? "Perdeu o Tempo!" : "Nenhum");

    document.getElementById("btn-plantar").disabled = estagioPlantio !== "Preparado";
    document.getElementById("btn-insumo").disabled = estagioPlantio !== "Crescimento" || insumoAplicado;
    document.getElementById("btn-colher").disabled = estagioPlantio !== "Pronto";
}

function log(mensagem) {
    caixaLogs.innerHTML = `- ${mensagem}<br>` + caixaLogs.innerHTML;
}

function rodarAnimacao1D(tipo, callback) {
    let largura = 20;
    let frame = 0;
    let maquina = tipo === "trator" ? "Oo=o>" : "[|||]>-o";
    
    const botoes = document.querySelectorAll("button");
    botoes.forEach(b => b.disabled = true);

    let intervalo = setInterval(() => {
        if (frame <= largura) {
            let estradasAntes = ".".repeat(frame);
            let estradaDepois = ".".repeat(largura - frame);
            telaCampo.innerText = `[${estradasAntes}${maquina}${estradaDepois}]`;
            frame++;
        } else {
            clearInterval(intervalo);
            telaCampo.innerText = "[....................]"; 
            botoes.forEach(b => b.disabled = false);
            callback(); 
        }
    }, 80); 
}

function plantar() {
    rodarAnimacao1D("trator", () => {
        estagioPlantio = "Crescimento";
        insumoAplicado = false;
        jaPerdeuTempoInsumo = false;
        log("Sementes plantadas com o trator!");
        atualizarInterface();
    });
}

function aplicarInsumo() {
    if (estagioPlantio === "Crescimento") {
        rodarAnimacao1D("trator", () => {
            insumoAplicado = true;
            log("Herbicida e Biofertilizante aplicados com sucesso via trator!");
            atualizarInterface();
        });
    } else {
        log("Ação indisponível.");
    }
}

function colher() {
    rodarAnimacao1D("colheitadeira", () => {
        log("Safra recolhida com sucesso pela colheitadeira!");
        estagioPlantio = "Preparado";
        atualizarInterface();
    });
}

function passarTurno() {
    turnoEstacao++;
    
    if (estagioPlantio === "Crescimento") {
        estagioPlantio = "Pronto";
        if (!insumoAplicado) {
            jaPerdeuTempoInsumo = true;
            log("Aviso: O plantio amadureceu! Você perdeu a janela para aplicar o herbicida/biofertilizante desta safra.");
        }
    }

    if (Math.random() > 0.5) {
        climaAtual = climas[Math.floor(Math.random() * climas.length)];
        log(`O clima mudou para: ${climaAtual}`);
    }

    if (turnoEstacao > turnosParaMudar) {
        turnoEstacao = 1;
        indiceEstacao = (indiceEstacao + 1) % estacoes.length;
        log(`A estação mudou! Bem-vindo ao ${estacoes[indiceEstacao]}.`);
    }

    atualizarInterface();
}

// Inicializa o estado do jogo
atualizarInterface();