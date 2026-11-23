import express, { Request, Response } from 'express';
import { Telemetria, Alerta } from './types';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const telemetrias: Telemetria[] = [];
const historicoAlertas: Alerta[] = [];

const POTENCIA_INSTALADA_KWP = 5;

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Usina Monitor API rodando' });
});

app.post('/telemetria', (req: Request, res: Response) => {
  const { potencia_ca, tensao_ca, corrente_ca, irradiancia, temperatura_modulo } = req.body;

  if (
    typeof potencia_ca !== 'number' ||
    typeof tensao_ca !== 'number' ||
    typeof corrente_ca !== 'number'
  ) {
    return res.status(400).json({
      mensagem: 'Envie potencia_ca, tensao_ca e corrente_ca como numeros.'
    });
  }

  const registro: Telemetria = {
    id: telemetrias.length + 1,
    timestamp: new Date().toISOString(),
    potencia_ca,
    tensao_ca,
    corrente_ca,
    irradiancia,
    temperatura_modulo,
  };

  telemetrias.push(registro);

  const penultimo = telemetrias[telemetrias.length - 2];
  const horaAtual = new Date().getHours();
  const dentroDoHorarioComercial = horaAtual >= 6 && horaAtual < 18;
  const zerado = registro.potencia_ca === 0 && registro.tensao_ca === 0 && registro.corrente_ca === 0;
  const zeradoAnterior = penultimo ? penultimo.potencia_ca === 0 && penultimo.tensao_ca === 0 && penultimo.corrente_ca === 0 : false;

  if (dentroDoHorarioComercial && zerado && zeradoAnterior) {
    const ultimoAlerta = historicoAlertas[historicoAlertas.length - 1];
    if (!ultimoAlerta || ultimoAlerta.telemetriaId !== penultimo?.id) {
      historicoAlertas.push({
        id: historicoAlertas.length + 1,
        timestamp: registro.timestamp,
        nivel: 'CRITICO',
        mensagem: 'ALERTA: Potencia zerada em 2 leituras seguidas durante horario comercial. Possivel falha ou disjuntor desarmado.',
        telemetriaId: registro.id,
      });
    }
  }

  res.status(201).json({
    mensagem: 'Telemetria recebida com sucesso',
    dado: registro,
  });
});

app.get('/usina/eficiencia', (req: Request, res: Response) => {
  if (telemetrias.length === 0) {
    return res.status(404).json({
      mensagem: 'Nenhuma telemetria registrada ainda. Envie dados via POST /telemetria primeiro.',
    });
  }

  const ultimo = telemetrias[telemetrias.length - 1];
  const irradiancia = ultimo.irradiancia ?? 1000;
  const potenciaEsperadaKw = POTENCIA_INSTALADA_KWP * (irradiancia / 1000);
  const potenciaRealKw = ultimo.potencia_ca / 1000;
  const performanceRatio = potenciaEsperadaKw > 0 ? potenciaRealKw / potenciaEsperadaKw : 0;

  res.json({
    potenciaRealGerada: potenciaRealKw.toFixed(2) + ' kW',
    potenciaEsperada: potenciaEsperadaKw.toFixed(2) + ' kW',
    potenciaInstalada: POTENCIA_INSTALADA_KWP.toFixed(2) + ' kWp',
    irradianciaUsada: irradiancia + ' W/m2',
    performanceRatio: Number(performanceRatio.toFixed(2)),
    performanceRatioPercentual: (performanceRatio * 100).toFixed(1) + '%',
    baseadoNoRegistro: ultimo,
  });
});

app.get('/alertas', (req: Request, res: Response) => {
  if (telemetrias.length === 0) {
    return res.status(404).json({
      mensagem: 'Nenhuma telemetria registrada ainda. Envie dados via POST /telemetria primeiro.',
    });
  }

  const ultimo = telemetrias[telemetrias.length - 1];
  const penultimo = telemetrias[telemetrias.length - 2];
  const horaAtual = new Date().getHours();
  const dentroDoHorarioComercial = horaAtual >= 6 && horaAtual < 18;

  const zerado = ultimo.potencia_ca === 0 && ultimo.tensao_ca === 0 && ultimo.corrente_ca === 0;
  const zeradoAnterior = penultimo ? penultimo.potencia_ca === 0 && penultimo.tensao_ca === 0 && penultimo.corrente_ca === 0 : false;
  const temAlerta = dentroDoHorarioComercial && zerado && zeradoAnterior;

  res.json({
    temAlerta,
    nivel: temAlerta ? 'CRITICO' : 'NORMAL',
    mensagem: temAlerta
      ? 'ALERTA: Potencia zerada em 2 leituras seguidas durante horario comercial. Possivel falha ou disjuntor desarmado.'
      : 'Nenhum alerta no momento.',
    horaAtual: horaAtual + 'h',
    dentroDoHorarioComercial,
    baseadoNoRegistro: ultimo,
  });
});

app.get('/alertas/historico', (req: Request, res: Response) => {
  res.json({
    total: historicoAlertas.length,
    alertas: historicoAlertas,
  });
});

export default app;