// src/app.js
const express = require('express');

const app = express();

app.use(express.json());

const telemetrias = [];

app.get('/', (req, res) => {
  res.json({ status: 'Usina Monitor API rodando 🔋' });
});

app.post('/telemetria', (req, res) => {
  const dados = req.body;

  const registro = {
    id: telemetrias.length + 1,
    timestamp: new Date().toISOString(),
    ...dados,
  };

  telemetrias.push(registro);

  res.status(201).json({
    mensagem: 'Telemetria recebida com sucesso',
    dado: registro,
  });
});

// Constantes da usina (por enquanto fixas, depois podem virar configuráveis)
const POTENCIA_INSTALADA_KWP = 5;
const HORAS_SOL_PLENO_PARELHAS = 5.5;

app.get('/usina/eficiencia', (req, res) => {
  if (telemetrias.length === 0) {
    return res.status(404).json({
      mensagem: 'Nenhuma telemetria registrada ainda. Envie dados via POST /telemetria primeiro.',
    });
  }

  // Pega o registro mais recente (o último da lista)
  const ultimoRegistro = telemetrias[telemetrias.length - 1];

  // Potência real gerada agora, convertendo de W para kW
  const potenciaRealGerada = ultimoRegistro.potencia_ca / 1000;

  // Calculando o Performance Ratio: potência real vs potência máxima instalada
  const performanceRatio = potenciaRealGerada / POTENCIA_INSTALADA_KWP;

  res.json({
    potenciaRealGerada: potenciaRealGerada.toFixed(2) + ' kW',
    potenciaInstalada: POTENCIA_INSTALADA_KWP.toFixed(2) + ' kW',
    performanceRatio: performanceRatio.toFixed(2),
    performanceRatioPercentual: (performanceRatio * 100).toFixed(1) + '%',
    baseadoNoRegistro: ultimoRegistro,
  });
});
// Horário comercial: das 6h às 18h, quando a usina deveria estar gerando energia
const HORA_INICIO_COMERCIAL = 6;
const HORA_FIM_COMERCIAL = 18;

// ROTA NOVA: verifica se há alerta de falha (potência zero em horário comercial)
app.get('/alertas', (req, res) => {
  if (telemetrias.length === 0) {
    return res.status(404).json({
      mensagem: 'Nenhuma telemetria registrada ainda. Envie dados via POST /telemetria primeiro.',
    });
  }

  const ultimoRegistro = telemetrias[telemetrias.length - 1];

  const agora = new Date();
  const horaAtual = agora.getHours(); // pega só a hora (0 a 23)

  const dentroDoHorarioComercial =
    horaAtual >= HORA_INICIO_COMERCIAL && horaAtual < HORA_FIM_COMERCIAL;

  const potenciaZerada = ultimoRegistro.potencia_ca === 0;

  const temAlerta = dentroDoHorarioComercial && potenciaZerada;

  res.json({
    temAlerta: temAlerta,
    mensagem: temAlerta
      ? 'ALERTA: Potência zerada durante horário comercial. Possível falha ou disjuntor desarmado.'
      : 'Nenhum alerta no momento.',
    horaAtual: horaAtual + 'h',
    dentroDoHorarioComercial: dentroDoHorarioComercial,
    baseadoNoRegistro: ultimoRegistro,
  });
});

module.exports = app;