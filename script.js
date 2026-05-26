// Configuração Inicial do Jogo
let coins = 30;
let seeds = 4;
let currentTool = 'plow'; // Começa com Arar habilitado
let isRaining = false;

// Estrutura para os 2 grandes terrenos
let farmPlots = [
    { isPlowed: false, status: 'empty', hasWeed: false, modifier: 1.0, growthProgress: 0, requiredGrowth: 3 },
    { isPlowed: false, status: 'empty', hasWeed: false, modifier: 1.0, growthProgress: 0, requiredGrowth: 3 }
];

const weatherDisplay = document.getElementById('weather-display');
const statusPanel = document.querySelector('.status-panel');

function init() {
    setupTools();
    render();
    
    // Loops Principais do Ciclo Agrícola (Prazos desacelerados a pedido do usuário)
    setInterval(weatherEngine, 24000); // Altera o clima a cada 24 segundos (Mais lento)
    setInterval(cropGrowthLoop, 6000); // Atualiza crescimento a cada 6 segundos (Mais lento)
    setInterval(weedSpawnEngine, 16000); // Chance de nascer praga a cada 16 segundos
}

// Controla as ferramentas ativas via Rato
function setupTools() {
    const tools = document.querySelectorAll('.tool-btn, .tool-btn-special');
    tools.forEach(btn => {
        btn.addEventListener('click', () => {
            tools.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.id.replace('tool-', '');
        });
    });

    document.getElementById('btn-buy-seed').addEventListener('click', () => {
        if (coins >= 3) {
            coins -= 3;
            seeds++;
            render();
        }
    });
}

// Mecânica de Clima (Chuva vs Sol)
function weatherEngine() {
    isRaining = Math.random() < 0.45; // 45% de hipótese de chover a cada ciclo
    
    if (isRaining) {
        weatherDisplay.innerText = "🌧️ Clima: Chovendo (Solo Nutrito)";
        statusPanel.classList.add('rainy-day');
    } else {
        weatherDisplay.innerText = "☀️ Clima: Ensolarado";
        statusPanel.classList.remove('rainy-day');
    }
}

// Ativa a animação visual usando uma foto diferente para cada tipo de ação
function triggerTractorAnimation(index, toolUsed) {
    const plotEl = document.getElementById(`plot-${index}`);
    const overlay = plotEl.querySelector('.tractor-overlay');
    
    // Limpa textos antigos
    overlay.innerText = "";
    
    // Configura o nome da foto para cada ação (Substitua os nomes entre aspas se precisar)
    if (toolUsed === 'plow') {
        overlay.style.backgroundImage = "url('trator.png')";
    } else if (toolUsed === 'plant') {
        overlay.style.backgroundImage = "url('tratorP.png')";
    } else if (toolUsed === 'bio') {
        overlay.style.backgroundImage = "url('tratorB.png')";
    } else if (toolUsed === 'herb') {
        overlay.style.backgroundImage = "url('tratorH.png')";
    } else if (toolUsed === 'harvest') {
        overlay.style.backgroundImage = "url('colheitadeira.png')";
    }
    
    plotEl.classList.add('working');
    
    // Remove a animação após 2 segundos e limpa a imagem do terreno
    setTimeout(() => {
        plotEl.classList.remove('working');
        overlay.style.backgroundImage = "none";
    }, 4000);
}

// Ações ao clicar com o rato num dos terrenos grandes
function handlePlotAction(index) {
    let plot = farmPlots[index];
    const plotEl = document.getElementById(`plot-${index}`);
    
    // Evita cliques se o implemento já estiver a passar na tela
    if (plotEl.classList.contains('working')) return;

    switch (currentTool) {
        case 'plow':
            if (!plot.isPlowed && plot.status === 'empty' && coins >= 5) {
                coins -= 5;
                plot.isPlowed = true;
                triggerTractorAnimation(index, 'plow');
            }
            break;

        case 'plant':
            // REGRA NOVA: Agora verifica se tem moedas suficientes para plantar (Ex: $2) e deduz o valor
            if (plot.isPlowed && plot.status === 'empty' && seeds > 0 && coins >= 5) {
                coins -= 5; // Deduz o custo do plantio
                seeds--;
                plot.status = 'planted';
                plot.growthProgress = 0;
                plot.requiredGrowth = isRaining ? 3 : 5; 
                plot.modifier = 1.0; 
                triggerTractorAnimation(index, 'plant');
            } else if (coins < 2 && plot.isPlowed && plot.status === 'empty' && seeds > 0) {
                alert("Sem dinheiro suficiente para plantar! Custa $2.");
            }
            break;

        case 'bio':
            // REGRA: Garante que só funciona estritamente quando a plantação está em crescimento ('growing')
            if (plot.status === 'growing') {
                if (plot.modifier === 1.0 && coins >= 8) {
                    coins -= 8;
                    plot.modifier = 1.7; // Incremento de 70% no rendimento
                    triggerTractorAnimation(index, 'bio');
                }
            } else {
                alert("Ação inválida! O Biofertilizante só pode ser aplicado na fase de crescimento. Você perdeu o tempo deste plantio!");
            }
            break;

        case 'herb':
            if (plot.status === 'growing') {
                if (plot.hasWeed && coins >= 4) {
                    coins -= 4;
                    plot.hasWeed = false;
                    plot.modifier = 0.75; 
                    triggerTractorAnimation(index, 'herb');
                }
            } else {
                alert("Ação inválida! O Herbicida só pode ser aplicado na fase de crescimento. Você perdeu o tempo deste plantio!");
            }
            break;

        case 'harvest':
            if (plot.status === 'ready') {
                let baseProfit = 15;
                if (plot.hasWeed) baseProfit -= 6;
                if (!isRaining) baseProfit -= 4;

                let finalProfit = Math.max(2, Math.round(baseProfit * plot.modifier));
                coins += finalProfit;

                plot.status = 'empty';
                plot.isPlowed = false;
                plot.hasWeed = false;
                plot.modifier = 1.0;
                plot.growthProgress = 0;
                
                triggerTractorAnimation(index, 'harvest');
            }
            break;
    }
    
    // Atualiza a tela logo após a ação ser validada
    setTimeout(render, 30);
}

// Loop de Crescimento Temporal das Plantas nos grandes terrenos
function cropGrowthLoop() {
    farmPlots.forEach((plot) => {
        if (plot.status === 'planted' || plot.status === 'growing') {
            
            let advanceChance = 1.0;
            if (plot.hasWeed) advanceChance -= 0.3;
            if (!isRaining) advanceChance -= 0.2; 

            if (Math.random() <= advanceChance) {
                plot.growthProgress++;
            }

            // Altera os status intermédios com base no avanço
            if (plot.growthProgress >= plot.requiredGrowth) {
                plot.status = 'ready';
            } else if (plot.growthProgress >= Math.floor(plot.requiredGrowth / 2)) {
                plot.status = 'growing';
            }
        }
    });
    render();
}

// Nascimento Espontâneo de Ervas Daninhas / Pragas
function weedSpawnEngine() {
    let target = Math.floor(Math.random() * 2);
    if (farmPlots[target].status !== 'empty') {
        farmPlots[target].hasWeed = true;
        render();
    }
}

// Atualiza o estado visual completo dos componentes HTML
function render() {
    document.getElementById('coins').innerText = coins;
    document.getElementById('seeds').innerText = seeds;

    farmPlots.forEach((plot, index) => {
        const plotEl = document.getElementById(`plot-${index}`);
        const contentEl = plotEl.querySelector('.plot-content');
        const indicatorsEl = plotEl.querySelector('.indicators');

        // Atualiza a classe de Solo Arado
        if (plot.isPlowed && plot.status === 'empty') {
            plotEl.classList.add('plowed');
            contentEl.innerText = "🚜 Solo Arado (Pronto p/ Plantio)";
        } else if (!plot.isPlowed && plot.status === 'empty') {
            plotEl.classList.remove('plowed');
            contentEl.innerText = "🟫 Terreno Bruto (Precisa Arar)";
        } else {
            plotEl.classList.remove('plowed'); 
        }

        // Exibe desenvolvimento da lavoura grande
        if (plot.status === 'planted') contentEl.innerText = "🌱 Sementes Brotando...";
        if (plot.status === 'growing') contentEl.innerText = "🌿 Lavoura em Crescimento (Janela de Insumos Aberta!)";
        if (plot.status === 'ready') contentEl.innerText = "🌾 Pronto para Colheita!";

        // Renderiza os crachás de status (Badges)
        indicatorsEl.innerHTML = '';
        if (plot.modifier > 1.0 && plot.status !== 'empty') {
            indicatorsEl.innerHTML += `<span class="badge bio">Biofertilizado (Rendimento +70%)</span>`;
        }
        if (plot.modifier < 1.0 && plot.status !== 'empty') {
            indicatorsEl.innerHTML += `<span class="badge herb">Herbicida Usado (Rendimento -25%)</span>`;
        }
        if (plot.hasWeed) {
            indicatorsEl.innerHTML += `<span class="badge weed">⚠️ Infestado de Pragas</span>`;
        }
    });
}

// Vincula os cliques diretamente aos terrenos grandes
window.onload = () => {
    init();
    document.getElementById('plot-0').addEventListener('click', () => handlePlotAction(0));
    document.getElementById('plot-1').addEventListener('click', () => handlePlotAction(1));
};