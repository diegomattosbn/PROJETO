import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import Dashboard from './modules/Dashboard';
import Clients from './modules/Clients';
import Products from './modules/Products';
import Finance from './modules/Finance';
import { ToastContainer } from './components/Toast';
import './index.css';

const TABS = [
  { key: 'dashboard', label: 'Visão Geral', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>)
  },
  { key: 'clients', label: 'Clientes', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>)
  },
  { key: 'products', label: 'Produtos', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>)
  },
  { key: 'finance', label: 'Financeiro', icon: (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>)
  },
];

export default function App() {
  const store = useAppStore();
  const [tab, setTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [toasts, setToasts] = useState([]);
  const searchRef = useRef(null);

  // Toast system
  const toast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // Global search
  useEffect(() => {
    if (!globalSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const q = globalSearch.toLowerCase();
    setSearchResults(store.clients.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6));
    setShowResults(true);
  }, [globalSearch, store.clients]);

  const handleSelectClient = useCallback((clientId) => {
    setSelectedClientId(clientId);
    setTab('clients');
    setGlobalSearch('');
    setShowResults(false);
  }, []);

  const handleTabSelectClient = useCallback((id) => {
    setSelectedClientId(id);
  }, []);

  const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const tabTitles = {
    dashboard: 'Visão Geral',
    clients: 'Clientes',
    products: 'Produtos',
    finance: 'Financeiro',
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-text">
            <span className="logo-main">Mattos</span>
            <span className="logo-sub">Loja de Roupas</span>

          </div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`sidebar-item ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>
        {/* Rodapé Sidebar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 'auto' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Produzido por Gritzky<br/>in Zaun Studio<br/>Todos os direitos reservados, 2026
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="header-title">{tabTitles[tab]}</div>
          </div>

          {/* Busca Global */}
          <div style={{ position: 'relative' }} ref={searchRef}>
            <div className="header-search">
              <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                placeholder="Buscar cliente..."
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
              />
              {globalSearch && (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }} onClick={() => { setGlobalSearch(''); setShowResults(false); }}>✕</button>
              )}
            </div>
            {showResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(c => (
                  <div key={c.id} className="search-result-item" onMouseDown={() => handleSelectClient(c.id)}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{c.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.phone || 'Sem telefone'}</div>
                    </div>
                    {store.getClientDebt(c.id) > 0 && (
                      <span className="search-result-debt">{fmt(store.getClientDebt(c.id))}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showResults && searchResults.length === 0 && globalSearch && (
              <div className="search-results">
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Nenhum cliente encontrado</div>
              </div>
            )}
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="page-content">
          {store.loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
              <div className="spinner" style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando dados...</div>
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
              `}</style>
            </div>
          ) : store.error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: 32, textAlign: 'center' }}>
              <div style={{ color: '#ef4444', fontSize: 32 }}>⚠️</div>
              <div style={{ fontWeight: 600 }}>Erro ao carregar dados</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 400 }}>{store.error}</div>
              <button 
                onClick={() => store.refresh()}
                style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {tab === 'dashboard' && <Dashboard store={store} onNavigate={setTab} />}
              {tab === 'clients' && (
                <Clients
                  store={store}
                  toast={toast}
                  selectedClientId={selectedClientId}
                  onSelectClient={handleTabSelectClient}
                />
              )}
              {tab === 'products' && <Products store={store} toast={toast} />}
              {tab === 'finance' && <Finance store={store} />}
            </>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}
