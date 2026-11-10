const CAPACIDADE = 4;
const TIPOS = ["Papel", "Vidro", "Metal", "Plastico"];
const TOTAL_LIXEIRAS = 6;

let lixeiras = [[], [], [], [], [], []];
let selectedBin = null;

// Trechos específicos das funções em C para exibição dinâmica
const snippetsC = {
  inicial: `/* Estado inicial: Pilhas prontas para receber os resíduos */
void inicializar(Pilha *p) {
    p->topo = -1; // Pilha vazia
}`,
  
  consultarTopo: `// 4. CONSULTAR TOPO (PEEK / Verificando Lixo Superior)
int consultarTopo(Pilha *p) {
    if (p->topo == -1) return -1; // Pilha vazia
    return p->itens[p->topo];    // Retorna o tipo do lixo no topo
}`,

  desempilharErro: `// 6. DESEMPILHAR (POP) - ERRO DE UNDERFLOW
int desempilhar(Pilha *p) {
    if (p->topo == -1) {
        printf("⚠️ Erro: Lixeira vazia! Underflow.\\n");
        return -1;
    }
}`,

  estaCheiaErro: `// 3. VERIFICAR SE ESTÁ CHEIA - ERRO DE OVERFLOW
int estaCheia(Pilha *p) {
    return p->topo == CAPACIDADE - 1; // Lixeira com 4 itens atingiu o limite
}`,

  movimentoInvalido: `// REGRAS DE PILHA: Tipo incompatível no topo
// Só é permitido empilhar sobre lixo do MESMO tipo ou lixeira vazia.
if (topoDestino != -1 && topoDestino != topoOrigem) {
    printf("❌ Movimento invalido! Tipos diferentes.\\n");
}`,

  sucessoMovimento: `// 5. & 6. EMPILHAR (PUSH) E DESEMPILHAR (POP) REALIZADOS COM SUCESSO!
int item = desempilhar(&origem); // p->topo--
empilhar(&destino, item);       // p->topo++; p->itens[p->topo] = item;`
};

function setSnippet(key, descText) {
  const codeEl = document.getElementById("c-code");
  const descEl = document.getElementById("code-desc");
  codeEl.textContent = snippetsC[key];
  descEl.innerText = descText;
  hljs.highlightElement(codeEl);
}

function initGame() {
  lixeiras = [[], [], [], [], [], []];
  selectedBin = null;
  
  let lixos = [];
  TIPOS.forEach(tipo => {
    for (let i = 0; i < CAPACIDADE; i++) lixos.push(tipo);
  });
  
  for (let i = lixos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [lixos[i], lixos[j]] = [lixos[j], lixos[i]];
  }
  
  for (let i = 0; i < 16; i++) {
    let binIdx = Math.floor(i / CAPACIDADE);
    lixeiras[binIdx].push(lixos[i]);
  }
  
  updateUI();
  updateStatus("Novo jogo iniciado! Clique em uma lixeira de origem.");
  setSnippet('inicial', 'As lixeiras foram inicializadas com topo = -1 (pilhas vazias).');
}

function updateUI() {
  const container = document.getElementById("bins-container");
  container.innerHTML = "";
  
  lixeiras.forEach((pilha, idx) => {
    const binDiv = document.createElement("div");
    binDiv.className = `bin ${selectedBin === idx ? "selected" : ""}`;
    binDiv.setAttribute("data-id", idx + 1);
    binDiv.onclick = () => handleBinClick(idx);
    
    pilha.forEach(tipo => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item";
      itemDiv.setAttribute("data-type", tipo);
      itemDiv.innerText = tipo;
      binDiv.appendChild(itemDiv);
    });
    
    container.appendChild(binDiv);
  });
  
  updateMemoryInspector();
  checkWin();
}

function handleBinClick(idx) {
  if (selectedBin === null) {
    if (lixeiras[idx].length === 0) {
      updateStatus(`⚠️ Lixeira ${idx + 1} está vazia!`, "error");
      setSnippet('desempilharErro', `A lixeira ${idx + 1} tentou desempilhar com topo = -1 (Underflow).`);
      return;
    }
    selectedBin = idx;
    const topoVal = lixeiras[idx][lixeiras[idx].length - 1];
    updateStatus(`Lixeira ${idx + 1} selecionada. Topo: ${topoVal}`);
    setSnippet('consultarTopo', `Consultando o topo da Lixeira ${idx + 1} (topo = ${lixeiras[idx].length - 1}, valor: ${topoVal}).`);
  } else {
    if (selectedBin === idx) {
      selectedBin = null;
      updateStatus("Seleção cancelada.");
      setSnippet('inicial', 'Ação cancelada pelo usuário.');
      updateUI();
      return;
    }
    
    const origem = lixeiras[selectedBin];
    const destino = lixeiras[idx];
    
    const itemOrigem = origem[origem.length - 1];
    const itemDestino = destino[destino.length - 1];
    
    if (destino.length >= CAPACIDADE) {
      updateStatus(`⚠️ Lixeira ${idx + 1} cheia!`, "error");
      setSnippet('estaCheiaErro', `A lixeira ${idx + 1} está com 4 elementos (cheia). Overflow evitado!`);
    } else if (destino.length > 0 && itemDestino !== itemOrigem) {
      updateStatus(`❌ Movimento inválido! Tipos diferentes.`, "error");
      setSnippet('movimentoInvalido', `Tentativa de colocar ${itemOrigem} em cima de ${itemDestino}. Regra de pilha negada.`);
    } else {
      const lixoRemovido = origem.pop();
      destino.push(lixoRemovido);
      updateStatus(`✅ Moveu ${lixoRemovido} com sucesso!`);
      setSnippet('sucessoMovimento', `Item ${lixoRemovido} removido da lixeira ${selectedBin + 1} e empilhado na lixeira ${idx + 1}.`);
    }
    
    selectedBin = null;
    updateUI();
  }
}

function updateMemoryInspector() {
  const memDiv = document.getElementById("memory-state");
  memDiv.innerHTML = "";
  
  lixeiras.forEach((pilha, idx) => {
    const topo = pilha.length - 1;
    let itensStr = pilha.join(", ");
    if (pilha.length === 0) itensStr = "vazio";
    
    const binMem = document.createElement("div");
    binMem.className = "bin-mem";
    binMem.innerHTML = `<strong>L[${idx}]</strong>: topo=<span class="topo-idx">${topo}</span> | [${itensStr}]`;
    memDiv.appendChild(binMem);
  });
}

function updateStatus(msg, type = "normal") {
  const statusEl = document.getElementById("game-status");
  statusEl.innerText = msg;
  statusEl.style.borderColor = type === "error" ? "#e53e3e" : "#ffcc00";
}

function checkWin() {
  let completas = 0;
  lixeiras.forEach(pilha => {
    if (pilha.length === CAPACIDADE) {
      const primeiro = pilha[0];
      if (pilha.every(item => item === primeiro)) {
        completas++;
      }
    }
  });
  
  if (completas === TIPOS.length) {
    updateStatus("🎉 PARABÉNS! Todos os 4 tipos organizados com pilhas!");
  }
}

function resetGame() {
  initGame();
}

window.onload = () => {
  initGame();
};