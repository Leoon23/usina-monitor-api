export interface Telemetria {
  id: number;
  timestamp: string;
  potencia_ca: number;
  tensao_ca: number;
  corrente_ca: number;
  irradiancia?: number;
  temperatura_modulo?: number;
}

export interface Alerta {
  id: number;
  timestamp: string;
  nivel: 'CRITICO';
  mensagem: string;
  telemetriaId: number;
}