type Props = {
  critico: boolean
  nivel?: string
}

export default function Header({ critico, nivel }: Props) {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <div>
          <h1>Monitor da Usina</h1>
          <p>Telemetria em tempo real</p>
        </div>
        <span className={'badge ' + (critico ? 'critico' : 'normal')}>
          {critico ? '● CRITICO' : '● ' + (nivel || 'NORMAL')}
        </span>
      </div>
    </header>
  )
}