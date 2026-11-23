// tipos que vem do backend
export type Atual = {
  nivel?: string
  temAlerta?: boolean
  mensagem: string
  horaAtual?: string
  baseadoNoRegistro?: {
    potencia_ca: number
    tensao_ca: number
    corrente_ca: number
  }
}

export type Alerta = {
  nivel: string
  mensagem: string
  timestamp: string
}