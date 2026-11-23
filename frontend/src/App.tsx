import { useEffect, useState } from 'react'
import './App.css'
import type { Atual, Alerta } from './types'
import Header from './components/Header'

function App() {
  const [atual, setAtual] = useState<Atual | null>(null)
  const [total, setTotal] = useState(0)
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  async function atualizar() {
    try {
      const [resAtual, resHist] = await Promise.all([
        fetch('/alertas'),
        fetch('/alertas/historico'),
      ])
      const dadosAtual = await resAtual.json()
      const dadosHist = await resHist.json()
      setAtual(dadosAtual)
      setTotal(dadosHist.total)
      setAlertas(dadosHist.alertas)
      setErro(false)
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    atualizar()
    const id = setInterval(atualizar, 3000)
    return () => clearInterval(id)
  }, [])

  const critico = !!atual?.temAlerta
  const registro = atual?.baseadoNoRegistro

  return (
    <>
      <Header critico={critico} nivel={atual?.nivel} />

      <main className="container">
        {erro && <p className="erro">Backend fora do ar. Verifique se a API está rodando na porta 3000.</p>}

        <section className={'card ' + (critico ? 'card-critico' : '')}>
          <div className="card-header">
            <h2>Status atual</h2>
            <span>{atual?.horaAtual ? 'Hora atual: ' + atual.horaAtual : ''}</span>
          </div>

          {carregando ? (
            <p className="vazio">Carregando...</p>
          ) : (
            <>
              <p className="mensagem">{atual?.mensagem || 'Sem dados'}</p>
              {registro && (
                <div className="detalhes">
                  <div><strong>Potência</strong>{registro.potencia_ca} W</div>
                  <div><strong>Tensão</strong>{registro.tensao_ca} V</div>
                  <div><strong>Corrente</strong>{registro.corrente_ca} A</div>
                </div>
              )}
            </>
          )}

          <div className="acoes">
            <button type="button" className="btn" onClick={atualizar}>Atualizar agora</button>
            <span className="total">Total de alertas: {total}</span>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Histórico de alertas</h2>
            <span>{total} registro(s)</span>
          </div>
          {alertas.length === 0 ? (
            <p className="vazio">Nenhum alerta registrado no histórico.</p>
          ) : (
            [...alertas].reverse().map((a, i) => (
              <div key={i} className="alerta-item">
                <div><span className="nivel">{a.nivel}</span> - {a.mensagem}</div>
                <div className="data">{new Date(a.timestamp).toLocaleString('pt-BR')}</div>
              </div>
            ))
          )}
        </section>
      </main>
    </>
  )
}

export default App