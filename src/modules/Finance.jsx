import React, { useMemo } from 'react';

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const LOW_STOCK = 5;

const PAYMENT_COLORS = {
  'PIX': '#1a7f74',
  'Dinheiro': '#4caf82',
  'Cartão de Crédito': '#7c5cbf',
  'Cartão de Débito': '#3b82f6',
  'Transferência': '#ff8c42',
  'Outro': '#9ba8bc',
};

export default function Finance({ store }) {
  // Produtos mais vendidos
  const topProducts = useMemo(() => {
    const map = {};
    store.transactions
      .filter(t => t.type === 'buy')
      .forEach(t => {
        if (!map[t.product_name]) map[t.product_name] = { name: t.product_name, qty: 0, revenue: 0 };
        map[t.product_name].qty += t.quantity;
        map[t.product_name].revenue += t.total;
      });
    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [store.transactions]);

  // Estoque crítico
  const criticalStock = store.products.filter(p => p.stock <= LOW_STOCK);

  // Totais globais
  const totalDebt = store.clients.reduce((a, c) => a + store.getClientDebt(c.id), 0);
  const totalReceived = store.transactions.filter(t => t.type === 'pay').reduce((a, t) => a + t.amount, 0);
  const totalSales = store.transactions.filter(t => t.type === 'buy').reduce((a, t) => a + t.total, 0);

  // Formas de pagamento
  const payMethods = useMemo(() => {
    const map = {};
    store.transactions
      .filter(t => t.type === 'pay')
      .forEach(t => {
        map[t.method] = (map[t.method] || 0) + t.amount;
      });
    const total = Object.values(map).reduce((a, v) => a + v, 0);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([name, val]) => ({ name, val, pct: total > 0 ? (val / total) * 100 : 0 }));
  }, [store.transactions]);

  const maxQty = topProducts[0]?.qty || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Métricas Globais */}
      <div className="grid-3">
        {/* Card 1 - Total Recebido - Rosa suave → Lavanda */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #e6a4d0 40%, #c9a0dc 100%)', border: 'none', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', width: 48, height: 48, borderRadius: 14 }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 0.5 }}>Total Recebido (Geral)</div>
          <div className="stat-card-value" style={{ color: 'white', fontWeight: 800 }}>{fmt(totalReceived)}</div>
        </div>

        {/* Card 2 - Total em Aberto - Pêssego suave → Laranja */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f8a4a4 100%)', border: 'none', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', width: 48, height: 48, borderRadius: 14 }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 0.5 }}>Total em Aberto (Dívidas)</div>
          <div className="stat-card-value" style={{ color: 'white', fontWeight: 800 }}>{fmt(totalDebt)}</div>
        </div>

        {/* Card 3 - Volume Total - Azul suave → Ciano */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #a1c4fd 0%, #89cff0 50%, #b8e6f0 100%)', border: 'none', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', width: 48, height: 48, borderRadius: 14 }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 0.5 }}>Volume Total de Vendas</div>
          <div className="stat-card-value" style={{ color: 'white', fontWeight: 800 }}>{fmt(totalSales)}</div>
          <div className="stat-card-sub" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
            📊 Taxa de recebimento: {totalSales > 0 ? ((totalReceived / totalSales) * 100).toFixed(0) : 0}%
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Ranking de Produtos */}
        <div className="card" style={{ borderRadius: 20, overflow: 'hidden', border: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #e6a4d0 100%)', padding: '18px 24px', margin: '-24px -24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ animation: 'iconFloat 4s ease-in-out infinite' }}>
                <path d="M6 9l6-6 6 6"/>
                <path d="M12 3v14"/>
                <path d="M5 21h14"/>
              </svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>Ranking de Produtos</span>
          </div>
          {topProducts.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-text">Sem vendas registradas</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topProducts.slice(0, 8).map((p, i) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, animation: `slideInRight 0.4s ease ${i * 0.08}s both` }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i === 0 ? 'linear-gradient(135deg, #ffd700, #ffb347)' : i === 1 ? 'linear-gradient(135deg, #c0c0c0, #e0e0e0)' : i === 2 ? 'linear-gradient(135deg, #cd7f32, #e8a87c)' : 'var(--bg-main)',
                    fontSize: 13, fontWeight: 800, color: i < 3 ? '#fff' : 'var(--text-muted)',
                    flexShrink: 0, boxShadow: i < 3 ? '0 3px 10px rgba(0,0,0,0.1)' : 'none',
                    animation: i < 3 ? 'iconPulse 3s ease-in-out infinite' : 'none',
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ background: 'var(--bg-main)', borderRadius: 50, height: 6, marginTop: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: i === 0 ? 'linear-gradient(90deg, #fbc2eb, #e6a4d0)' : i === 1 ? 'linear-gradient(90deg, #a1c4fd, #89cff0)' : 'linear-gradient(90deg, #ffecd2, #fcb69f)', borderRadius: 50, '--target-width': `${(p.qty / maxQty) * 100}%`, animation: 'fillBarVar 1s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{p.qty} un.</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(p.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formas de Pagamento */}
        <div className="card" style={{ borderRadius: 20, overflow: 'hidden', border: 'none' }}>
          <div style={{ background: 'linear-gradient(135deg, #a1c4fd 0%, #89cff0 100%)', padding: '18px 24px', margin: '-24px -24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ animation: 'iconFloat 4s ease-in-out infinite' }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>Formas de Pagamento</span>
          </div>
          {payMethods.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">💳</div><div className="empty-state-text">Sem pagamentos registrados</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {payMethods.map(m => (
                <div key={m.name} className="payment-bar-item">
                  <div className="payment-bar-label">{m.name}</div>
                  <div className="payment-bar-bg">
                    <div className="payment-bar-fill" style={{ '--target-width': `${m.pct}%`, background: PAYMENT_COLORS[m.name] || 'linear-gradient(90deg, #a1c4fd, #89cff0)', animation: 'fillBarVar 1s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
                  </div>
                  <div className="payment-bar-value">{m.pct.toFixed(0)}%</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alerta de Estoque Crítico */}
      {criticalStock.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid var(--accent-red)' }}>
          <div className="card-header">
            <span className="card-title">🚨 Alerta de Estoque Crítico</span>
            <span className="badge badge-red">{criticalStock.length} produto(s)</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Produto</th><th>Estoque Atual</th><th>Status</th></tr></thead>
              <tbody>
                {criticalStock.sort((a, b) => a.stock - b.stock).map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--accent-red)' : 'var(--accent-orange)' }}>{p.stock} unidades</td>
                    <td>
                      {p.stock === 0
                        ? <span className="badge badge-red">Esgotado</span>
                        : <span className="badge badge-orange">Estoque Baixo</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
