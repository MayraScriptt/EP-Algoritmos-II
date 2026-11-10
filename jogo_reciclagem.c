#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define CAPACIDADE 4
#define TOTAL_LIXEIRAS 6
#define TIPOS_LIXO 4

const char* NOMES_LIXO[TIPOS_LIXO] = {"Papel", "Vidro", "Metal", "Plastico"};

typedef struct {
    int topo;
    int itens[CAPACIDADE];
} Pilha;

void inicializar(Pilha *p) {
    p->topo = -1;
}

int estaVazia(Pilha *p) {
    return p->topo == -1;
}

int estaCheia(Pilha *p) {
    return p->topo == CAPACIDADE - 1;
}

int consultarTopo(Pilha *p) {
    if (estaVazia(p)) return -1;
    return p->itens[p->topo];
}

int empilhar(Pilha *p, int elemento) {
    if (estaCheia(p)) {
        printf("⚠️ Erro: Lixeira cheia! (Overflow)\n");
        return 0;
    }
    p->topo++;
    p->itens[p->topo] = elemento;
    return 1;
}

int desempilhar(Pilha *p) {
    if (estaVazia(p)) {
        printf("⚠️ Erro: Lixeira vazia! (Underflow)\n");
        return -1;
    }
    int elemento = p->itens[p->topo];
    p->topo--;
    return elemento;
}

int mover(Pilha *origem, Pilha *destino) {
    if (estaVazia(origem)) {
        printf("❌ Movimento invalido: A lixeira de origem esta vazia.\n");
        return 0;
    }
    if (estaCheia(destino)) {
        printf("❌ Movimento invalido: A lixeira de destino esta cheia.\n");
        return 0;
    }
    
    int topoOrigem = consultarTopo(origem);
    int topoDestino = consultarTopo(destino);
    
    if (topoDestino == -1 || topoDestino == topoOrigem) {
        int item = desempilhar(origem);
        empilhar(destino, item);
        return 1;
    } else {
        printf("❌ Movimento invalido: Tipos diferentes!\n");
        return 0;
    }
}

int verificarVitoria(Pilha lixeiras[]) {
    int completas = 0;
    for (int i = 0; i < TOTAL_LIXEIRAS; i++) {
        if (estaCheia(&lixeiras[i])) {
            int tipoBase = lixeiras[i].itens[0];
            int uniforme = 1;
            for (int j = 1; j < CAPACIDADE; j++) {
                if (lixeiras[i].itens[j] != tipoBase) {
                    uniforme = 0;
                    break;
                }
            }
            if (uniforme) completas++;
        }
    }
    return completas == TIPOS_LIXO;
}

void exibirJogo(Pilha lixeiras[]) {
    printf("\n========== ESTADO DA RECICLAGEM (ECOSORT) ==========\n");
    for (int nivel = CAPACIDADE - 1; nivel >= 0; nivel--) {
        for (int i = 0; i < TOTAL_LIXEIRAS; i++) {
            if (lixeiras[i].topo >= nivel) {
                int tipo = lixeiras[i].itens[nivel];
                printf("[%-8s] ", NOMES_LIXO[tipo]);
            } else {
                printf("[        ] ");
            }
        }
        printf("\n");
    }
    printf("--------------------------------------------------------------------\n");
    for (int i = 0; i < TOTAL_LIXEIRAS; i++) {
        printf("Lixeira %d   ", i + 1);
    }
    printf("\n====================================================================\n");
}

void embaralharEDistribuir(Pilha lixeiras[]) {
    int totalItens = TIPOS_LIXO * CAPACIDADE;
    int lixos[16];
    int idx = 0;
    for (int t = 0; t < TIPOS_LIXO; t++) {
        for (int c = 0; c < CAPACIDADE; c++) {
            lixos[idx++] = t;
        }
    }
    
    srand(time(NULL));
    for (int i = totalItens - 1; i > 0; i--) {
        int j = rand() % (i + 1);
        int temp = lixos[i];
        lixos[i] = lixos[j];
        lixos[j] = temp;
    }
    
    idx = 0;
    for (int i = 0; i < TIPOS_LIXO; i++) {
        for (int c = 0; c < CAPACIDADE; c++) {
            empilhar(&lixeiras[i], lixos[idx++]);
        }
    }
}

int main() {
    Pilha lixeiras[TOTAL_LIXEIRAS];
    for (int i = 0; i < TOTAL_LIXEIRAS; i++) {
        inicializar(&lixeiras[i]);
    }
    embaralharEDistribuir(lixeiras);
    
    int orig, dest;
    while (!verificarVitoria(lixeiras)) {
        exibirJogo(lixeiras);
        printf("\nInforme ORIGEM e DESTINO (ex: 1 5): ");
        if (scanf("%d %d", &orig, &dest) != 2) break;
        orig--; dest--;
        if (orig < 0 || orig >= TOTAL_LIXEIRAS || dest < 0 || dest >= TOTAL_LIXEIRAS) continue;
        mover(&lixeiras[orig], &lixeiras[dest]);
    }
    printf("\n🎉 PARABÉNS! Jogo vencido!\n");
    return 0;
}