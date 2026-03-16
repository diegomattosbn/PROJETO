import React, { useState, useMemo } from 'react';

function fmt(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function filterByPeriod(transactions, period, customFrom, customTo) {
  const now = new Date();
  return transactions.filter(t => {
    const d = new Date(t.date);
    const dLocal = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === 'day') {
      return dLocal.getTime() === nowLocal.getTime();
    } else if (period === 'week') {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    } else if (period === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (period === 'custom' && customFrom && customTo) {
      return d >= new Date(customFrom) && d <= new Date(customTo + 'T23:59:59');
    }
    return true;
  });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { text: 'Bom dia', emoji: '☀️' };
  if (h >= 12 && h < 18) return { text: 'Boa tarde', emoji: '🌤️' };
  return { text: 'Boa noite', emoji: '🌙' };
}

export default function Dashboard({ store, onNavigate }) {
  const [period, setPeriod] = useState('month');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filtered = useMemo(() =>
    filterByPeriod(store.transactions, period, customFrom, customTo),
    [store.transactions, period, customFrom, customTo]
  );

  const totalReceived = useMemo(() =>
    filtered.filter(t => t.type === 'pay').reduce((a, t) => a + t.amount, 0),
    [filtered]
  );

  const totalSalesValue = useMemo(() =>
    filtered.filter(t => t.type === 'buy').reduce((a, t) => a + (t.total || 0), 0),
    [filtered]
  );

  const productSales = useMemo(() => {
    const map = {};
    filtered.filter(t => t.type === 'buy').forEach(t => {
      map[t.product_name] = (map[t.product_name] || 0) + t.quantity;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const topProduct = productSales[0];

  const clientSales = useMemo(() => {
    const map = {};
    filtered.filter(t => t.type === 'buy').forEach(t => {
      const client = store.clients.find(c => c.id === t.client_id);
      if (client) map[client.name] = (map[client.name] || 0) + t.total;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filtered, store.clients]);

  const topClient = clientSales[0];

  // Receitas vs Dívidas globais
  const totalDebt = store.clients.reduce((acc, c) => acc + store.getClientDebt(c.id), 0);
  const allPay = store.transactions.filter(t => t.type === 'pay').reduce((a, t) => a + t.amount, 0);

  const greeting = getGreeting();

  return (
    <div>
      {/* Banner de Boas-vindas */}
      <div style={{
        background: 'linear-gradient(135deg, #fbc2eb 0%, #e6a4d0 30%, #c9a0dc 60%, #a1c4fd 100%)',
        backgroundSize: '200% 200%',
        animation: 'cardColorBreath 8s ease-in-out infinite',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
      }}>
        <div style={{ position: 'absolute', top: -30, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: 10, right: 200, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.9, marginBottom: 4 }}>{greeting.emoji} {greeting.text}!</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>Bem-vindo ao Mattos Store</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Acompanhe suas vendas e controle seus clientes em um só lugar.</div>
        </div>
        <button onClick={() => onNavigate && onNavigate('clients')} style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 50,
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex', alignItems: 'center', gap: 8,
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; e.currentTarget.style.transform = 'none'; }}
        >
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ animation: 'iconFloat 3s ease-in-out infinite' }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
          Vamos às vendas?
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between gap-16" style={{ marginBottom: 24 }}>
        <div className="period-filter">
          {[
            { key: 'day', label: 'Hoje' },
            { key: 'week', label: 'Semanal' },
            { key: 'month', label: 'Mensal' },
            { key: 'custom', label: 'Personalizado' },
          ].map(p => (
            <button
              key={p.key}
              className={`period-btn ${period === p.key ? 'active' : ''}`}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === 'custom' && (
          <div className="flex gap-8 items-center">
            <input type="date" className="form-control" style={{ width: 150 }} value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>até</span>
            <input type="date" className="form-control" style={{ width: 150 }} value={customTo} onChange={e => setCustomTo(e.target.value)} />
          </div>
        )}
      </div>

      {/* Cards de resumo */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        {/* Card 1 - Movimentações - Rosa suave → Lavanda */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #e6a4d0 40%, #c9a0dc 100%)', border: 'none', color: 'white', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', width: 48, height: 48, borderRadius: 14 }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 0.5 }}>Movimentações do Período</div>
          <div className="stat-card-value" style={{ color: 'white', fontSize: 26, fontWeight: 800 }}>{fmt(totalSalesValue)}</div>
          <div className="stat-card-sub" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 12 }}>Total Vendido</div>
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
            💳 Recebido: <span style={{ fontWeight: 700 }}>{fmt(totalReceived)}</span>
          </div>
        </div>

        {/* Card 2 - Produto - Pêssego suave → Laranja */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #f8a4a4 100%)', border: 'none', color: 'white', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', width: 48, height: 48, borderRadius: 14 }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 0.5 }}>Produto Mais Vendido</div>
          <div className="stat-card-value" style={{ fontSize: 20, color: 'white', fontWeight: 800 }}>
            {topProduct ? topProduct[0] : '—'}
          </div>
          <div className="stat-card-sub" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{topProduct ? `🏷️ ${topProduct[1]} unidades vendidas` : 'Sem vendas no período'}</div>
        </div>

        {/* Card 3 - Cliente - Azul suave → Ciano */}
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #a1c4fd 0%, #89cff0 50%, #b8e6f0 100%)', border: 'none', color: 'white', borderRadius: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -10, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div className="stat-card-icon" style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)', width: 48, height: 48, borderRadius: 14 }}>
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
              <path d="M21 21v-2a4 4 0 00-3-3.87"/>
            </svg>
          </div>
          <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 0.5 }}>Cliente que Mais Compra</div>
          <div className="stat-card-value" style={{ fontSize: 20, color: 'white', fontWeight: 800 }}>
            {topClient ? topClient[0] : '—'}
          </div>
          <div className="stat-card-sub" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>{topClient ? `🛒 ${fmt(topClient[1])} em compras` : 'Sem dados no período'}</div>
        </div>
      </div>

    </div>
  );
}
