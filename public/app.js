async function atualizar() {
  const resAtual = await fetch('/alertas');
  const atual = await resAtual.json();
  const hist = await fetch('/alertas/historico').then(r => r.json());

  const badge = document.getElementById('badge-status');
  const msg = document.getElementById('mensagem-atual');
  const detalhes = document.getElementById('detalhes-atual');
  const hora = document.getElementById('hora-atual');

  if (atual.nivel) {
    badge.textContent = atual.nivel;
    badge.className = 'badge ' + (atual.temAlerta ? 'critico' : 'normal');
    msg.textContent = atual.mensagem;
    hora.textContent = 'Hora atual: ' + atual.horaAtual;
    const u = atual.baseadoNoRegistro;
    detalhes.innerHTML = `
      <div><strong>Potencia</strong>${u.potencia_ca} W</div>
      <div><strong>Tensao</strong>${u.tensao_ca} V</div>
      <div><strong>Corrente</strong>${u.corrente_ca} A</div>
    `;
  } else {
    badge.textContent = 'Sem dados';
    badge.className = 'badge';
    msg.textContent = atual.mensagem;
    detalhes.innerHTML = '';
  }

  document.getElementById('total-alertas').textContent = 'Total: ' + hist.total;
  document.getElementById('lista-alertas').innerHTML = hist.alertas.length
    ? hist.alertas.map(a => `
      <div class="alerta-item">
        <div><span class="nivel">${a.nivel}</span> - ${a.mensagem}</div>
        <div class="data">${new Date(a.timestamp).toLocaleString('pt-BR')}</div>
      </div>`).join('')
    : '<p class="vazio">Nenhum alerta registrado no historico.</p>';
}

document.getElementById('btn-atualizar').addEventListener('click', atualizar);
atualizar();
setInterval(atualizar, 5000);