# ☀️ Usina Monitor API

API REST para telemetria e monitoramento de usinas solares, desenvolvida em Node.js e Express. O sistema recebe dados de inversores fotovoltaicos (potência, tensão, corrente) e aplica regras de negócio reais do setor de energia solar — como o cálculo de Performance Ratio (PR) e a detecção automática de falhas.

## 🎯 Sobre o projeto

Toda usina fotovoltaica precisa ser monitorada para garantir que está performando como esperado. Este projeto simula esse monitoramento: recebe a telemetria enviada por um inversor solar, calcula a eficiência da usina comparando a potência real gerada com a potência instalada, e detecta automaticamente sinais de falha (como potência zerada durante o horário comercial, que indica possível disjuntor desarmado).

## 🚀 Tecnologias utilizadas

- Node.js
- Express
- TypeScript
- Thunder Client (para testes de API durante o desenvolvimento)

## 📌 Endpoints disponíveis

### GET /

Verifica se a API está no ar.

### POST /telemetria

Recebe os dados enviados por um inversor solar.

Corpo da requisição (JSON):

    {
      "potencia_ca": 4000,
      "tensao_cc": 380,
      "corrente_cc": 12.5,
      "eficiencia_dia": 0.87
    }

Cada registro recebido ganha automaticamente um id sequencial e um timestamp de quando chegou.

### GET /usina/eficiencia

Calcula o Performance Ratio (PR) da usina com base no registro de telemetria mais recente:

    PR = Potência Real Gerada / Potência Instalada

Retorna a potência real, a potência instalada, o PR (em decimal e percentual) e o registro usado no cálculo.

### GET /alertas

Verifica se há sinal de falha na usina: potência zerada durante o horário comercial (06h-18h). Se as duas condições ocorrerem juntas, retorna um alerta indicando possível disjuntor desarmado ou falha no inversor.

## 🧠 Lógica de negócio aplicada

- Performance Ratio: métrica usada no mercado de energia solar para avaliar se uma usina está gerando o esperado, considerando sua capacidade instalada.
- Detecção de falha por regra combinada: o alerta só dispara quando duas condições são verdadeiras ao mesmo tempo (potência zero e horário comercial), evitando falsos positivos durante a noite, quando a ausência de geração é normal.

## 🏗️ Estrutura do projeto

    usina-monitor-api/
    ├── src/
    ├── server.ts
    ├── package.json
    └── .gitignore

## ▶️ Como rodar o projeto localmente

    git clone https://github.com/Leoon23/usina-monitor-api.git
    cd usina-monitor-api
    npm install
    npm run dev

O servidor sobe em http://localhost:3000.

Para testar as rotas POST /telemetria, GET /usina/eficiencia e GET /alertas, recomenda-se o uso do Thunder Client (extensão do VS Code) ou qualquer outra ferramenta de teste de API.

Observação: os dados são armazenados em memória (array), ou seja, são reiniciados sempre que o servidor é reiniciado. A migração para um banco de dados persistente (PostgreSQL) está planejada como próxima etapa do projeto.

## 🗺️ Roadmap

- [ ] Migração da persistência de dados para PostgreSQL
- [ ] Validação de dados de entrada na rota POST /telemetria
- [ ] Testes automatizados

## 👨‍💻 Autor

Leonardo Cardoso Silva
Desenvolvedor Full Stack (JavaScript/Node.js), com background técnico em Eletrotécnica e IoT.

- GitHub: https://github.com/Leoon23
- LinkedIn: https://linkedin.com/in/leonardosilva-cardoso