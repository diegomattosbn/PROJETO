import React, { useState, useMemo } from 'react';
import SecurityModal from '../components/SecurityModal';

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const METHODS = ['PIX', 'Dinheiro', 'Crédito', 'Débito', 'Transferência', 'Outro'];

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="modal-title" style={{ margin: 0 }}>{title}</h2>
          <button className="btn btn-secondary btn-sm btn-icon" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function EditClientModal({ client, onSave, onClose }) {
  const [form, setForm] = useState({ name: client.name, cpf: client.cpf || '', phone: client.phone || '', address: client.address || '' });
  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Editar Cliente" onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { if (!form.name.trim()) return; onSave(form); }}>Salvar</button>
        </>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-control" value={form.name} onChange={update('name')} placeholder="Nome completo" />
        </div>
        <div className="form-group">
          <label className="form-label">CPF (Opcional)</label>
          <input className="form-control" value={form.cpf} onChange={update('cpf')} placeholder="000.000.000-00" />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-control" value={form.phone} onChange={update('phone')} placeholder="(11) 99999-9999" />
        </div>
        <div className="form-group">
          <label className="form-label">Endereço</label>
          <input className="form-control" value={form.address} onChange={update('address')} placeholder="Rua, número, bairro" />
        </div>
      </div>
    </Modal>
  );
}

function AddClientModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', cpf: '', phone: '', address: '' });
  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Novo Cliente" onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => { if (!form.name.trim()) return; onSave(form); }}>Cadastrar</button>
        </>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Nome *</label>
          <input className="form-control" value={form.name} onChange={update('name')} placeholder="Nome completo" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">CPF (Opcional)</label>
          <input className="form-control" value={form.cpf} onChange={update('cpf')} placeholder="000.000.000-00" />
        </div>
        <div className="form-group">
          <label className="form-label">Telefone</label>
          <input className="form-control" value={form.phone} onChange={update('phone')} placeholder="(11) 99999-9999" />
        </div>
        <div className="form-group">
          <label className="form-label">Endereço</label>
          <input className="form-control" value={form.address} onChange={update('address')} placeholder="Rua, número, bairro" />
        </div>
      </div>
    </Modal>
  );
}

function BuyModal({ products, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ productId: '', quantity: 1, unitPrice: '', obs: '', date: today });
  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  
  const selectedProduct = products.find(p => p.id === form.productId);
  const total = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0);

  const handleProductChange = e => {
    const p = products.find(x => x.id === e.target.value);
    setForm(prev => ({ ...prev, productId: e.target.value, unitPrice: p ? String(p.price) : '' }));
  };

  return (
    <Modal title="Registrar Compra" onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.productId || !form.quantity || !form.unitPrice) return;
            onSave({ 
              productId: form.productId, 
              productName: selectedProduct?.name, 
              quantity: Number(form.quantity), 
              unitPrice: Number(form.unitPrice), 
              obs: form.obs, 
              date: form.date ? new Date(form.date + 'T12:00:00').toISOString() : new Date().toISOString() 
            });
          }}>Registrar</button>
        </>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Produto</label>
          <select className="form-control" value={form.productId} onChange={handleProductChange}>
            <option value="">Selecione um produto...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock})</option>)}
          </select>
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Quantidade</label>
            <input type="number" className="form-control" value={form.quantity} min={1} onChange={update('quantity')} />
          </div>
          <div className="form-group">
            <label className="form-label">Preço Unitário (R$)</label>
            <input type="number" className="form-control" value={form.unitPrice} step="0.01" onChange={update('unitPrice')} />
          </div>
        </div>
        <div style={{ background: 'var(--primary-light)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(167,139,250,0.2)' }}>
          <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Total da Compra</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{fmt(total)}</span>
        </div>
        <div className="form-group">
          <label className="form-label">Data</label>
          <input type="date" className="form-control" value={form.date} onChange={update('date')} />
        </div>
        <div className="form-group">
          <label className="form-label">Observação</label>
          <input className="form-control" value={form.obs} onChange={update('obs')} placeholder="Opcional" />
        </div>
      </div>
    </Modal>
  );
}

function PayModal({ debt, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ amount: '', method: 'PIX', obs: '', date: today });
  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Registrar Pagamento" onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ background: 'var(--accent-green)' }} onClick={() => {
            if (!form.amount || Number(form.amount) <= 0) return;
            onSave({ 
              amount: Number(form.amount), 
              method: form.method, 
              obs: form.obs, 
              date: form.date ? new Date(form.date + 'T12:00:00').toISOString() : new Date().toISOString() 
            });
          }}>Confirmar Pagamento</button>
        </>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'rgba(255,107,107,0.08)', borderRadius: 12, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,107,107,0.15)' }}>
          <span style={{ fontSize: 13, color: 'var(--accent-red)', fontWeight: 600 }}>Saldo Devedor</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-red)' }}>{fmt(debt)}</span>
        </div>
        <div className="form-group">
          <label className="form-label">Valor do Pagamento (R$)</label>
          <input type="number" className="form-control" value={form.amount} step="0.01" onChange={update('amount')} placeholder="0,00" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">Forma de Pagamento</label>
          <select className="form-control" value={form.method} onChange={update('method')}>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Data</label>
          <input type="date" className="form-control" value={form.date} onChange={update('date')} />
        </div>
        <div className="form-group">
          <label className="form-label">Observação</label>
          <input className="form-control" value={form.obs} onChange={update('obs')} placeholder="Opcional" />
        </div>
      </div>
    </Modal>
  );
}

function EditTxModal({ tx, products, onSave, onClose }) {
  const [form, setForm] = useState({ ...tx });
  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  if (tx.type === 'buy') {
    const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);
    return (
      <Modal title="Editar Compra" onClose={onClose}
        footer={
          <>
            <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={() => onSave({ ...form, quantity: Number(form.quantity), unit_price: Number(form.unitPrice), total })}>Salvar</button>
          </>
        }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Produto: {tx.product_name}</label>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Quantidade</label>
              <input type="number" className="form-control" value={form.quantity} min={1} onChange={update('quantity')} />
            </div>
            <div className="form-group">
              <label className="form-label">Preço Unit. (R$)</label>
              <input type="number" className="form-control" value={form.unit_price} step="0.01" onChange={update('unit_price')} />
            </div>
          </div>
          <div style={{ background: 'var(--primary-light)', borderRadius: 12, padding: '12px 16px' }}>
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Total: {fmt(total)}</span>
          </div>
          <div className="form-group">
            <label className="form-label">Data</label>
            <input type="date" className="form-control" value={(form.date || '').split('T')[0]} onChange={e => setForm(p => ({ ...p, date: new Date(e.target.value).toISOString() }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Observação</label>
            <input className="form-control" value={form.obs || ''} onChange={update('obs')} />
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Editar Pagamento" onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={() => onSave({ ...form, amount: Number(form.amount) })}>Salvar</button>
        </>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-group">
          <label className="form-label">Valor (R$)</label>
          <input type="number" className="form-control" value={form.amount} step="0.01" onChange={update('amount')} />
        </div>
        <div className="form-group">
          <label className="form-label">Forma de Pagamento</label>
          <select className="form-control" value={form.method} onChange={update('method')}>
            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Data</label>
          <input type="date" className="form-control" value={(form.date || '').split('T')[0]} onChange={e => setForm(p => ({ ...p, date: new Date(e.target.value).toISOString() }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Observação</label>
          <input className="form-control" value={form.obs || ''} onChange={update('obs')} />
        </div>
      </div>
    </Modal>
  );
}

export default function Clients({ store, toast, selectedClientId, onSelectClient }) {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [editTx, setEditTx] = useState(null);
  const [securityModal, setSecurityModal] = useState(null); // { title, onConfirm }

  const filtered = useMemo(() =>
    store.clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [store.clients, search]
  );

  const selected = store.clients.find(c => c.id === selectedClientId);
  const debt = selected ? store.getClientDebt(selected.id) : 0;
  const txs = selected ? store.getClientTransactions(selected.id) : [];

  return (
    <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
      {/* Painel Esquerdo: Lista */}
      <div>
        <div className="card">
          <div className="flex items-center justify-between gap-12" style={{ marginBottom: 16 }}>
            <div className="header-search" style={{ flex: 1, width: 'auto' }}>
              <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..." />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>+ Novo</button>
          </div>
          <div className="client-list">
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <div className="empty-state-text">Nenhum cliente encontrado</div>
              </div>
            )}
            {filtered.map(c => (
              <div key={c.id} className={`client-list-item ${selectedClientId === c.id ? 'active' : ''}`} onClick={() => onSelectClient(c.id)}>
                <div className="avatar">{c.name.charAt(0)}</div>
                <div className="info">
                  <div className="name">{c.name}</div>
                  <div className="phone">{c.phone || 'Sem telefone'}</div>
                </div>
                {store.getClientDebt(c.id) > 0 && (
                  <div className="client-debt">{fmt(store.getClientDebt(c.id))}</div>
                )}
                {store.getClientDebt(c.id) === 0 && (
                  <span className="badge badge-green">Quitado</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel Direito: Perfil */}
      <div>
        {!selected ? (
          <div className="card" style={{ minHeight: 400 }}>
            <div className="empty-state" style={{ minHeight: 380 }}>
              <div className="empty-state-icon">👈</div>
              <div className="empty-state-text">Selecione um cliente para ver o perfil</div>
            </div>
          </div>
        ) : (
          <>
            {/* Card Financeiro */}
            <div style={{
              background: debt > 0 ? 'linear-gradient(135deg, #ff6b6b, #ee5253)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
              borderRadius: 'var(--radius-lg)',
              padding: 24,
              color: 'white',
              marginBottom: 16,
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {debt > 0 ? 'Valor Restante / Saldo Devedor' : 'Situação Financeira'}
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{fmt(debt)}</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>
                    {debt > 0 ? `${txs.filter(t => t.type === 'buy').length} compras em aberto` : '✓ Cliente sem débitos'}
                  </div>
                </div>
                <div style={{ fontSize: 48 }}>{debt > 0 ? '⚠️' : '✅'}</div>
              </div>
            </div>

            {/* Info + Ações */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                <div className="flex items-center gap-12">
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 18 }}>{selected.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{selected.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selected.phone || '—'}</div>
                  </div>
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-secondary btn-sm" onClick={() => setModal('edit')}>✏️ Editar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    setSecurityModal({
                      title: `Excluir Cliente: ${selected.name}`,
                      onConfirm: async () => {
                        await store.deleteClient(selected.id);
                        setSecurityModal(null);
                        onSelectClient(null);
                        toast('Cliente removido com sucesso', 'success');
                      }
                    });
                  }}>🗑️ Excluir</button>
                </div>
              </div>
              {selected.address && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-main)', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
                  📍 {selected.address}
                </div>
              )}
              {selected.cpf && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  🪪 CPF: {selected.cpf}
                </div>
              )}
              <div className="flex gap-12">
                <button className="btn btn-primary w-full" onClick={() => setModal('buy')}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                  Comprar
                </button>
                <button className="btn w-full" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', backgroundSize: '200% 200%', animation: 'btnGradient 4s ease infinite', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(45,206,137,0.3)' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(45,206,137,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(45,206,137,0.3)'; }}
                  onClick={() => setModal('pay')}>
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  Pagar
                </button>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="btn w-full" style={{ background: 'linear-gradient(135deg, #fbc2eb 0%, #c9a0dc 50%, #a1c4fd 100%)', backgroundSize: '200% 200%', animation: 'btnGradient 5s ease infinite', color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(201,160,220,0.3)', fontSize: 13 }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(201,160,220,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(201,160,220,0.3)'; }}
                  onClick={() => {
                  const clientTxs = store.getClientTransactions(selected.id);
                  const cDebt = store.getClientDebt(selected.id);
                  const printContent = `
                    <html><head>
                    <title>Extrato - ${selected.name}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
                    <style>
                      * { margin:0; padding:0; box-sizing:border-box; }
                      body { font-family: 'Poppins', Arial, sans-serif; color: #1a2035; background: #f0f4fa; }

                      .header-bar {
                        background: linear-gradient(135deg, #fbc2eb 0%, #e6a4d0 30%, #c9a0dc 60%, #a1c4fd 100%);
                        padding: 28px 40px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                      }
                      .logo { font-family: 'Dancing Script', cursive; font-size: 32px; color: white; font-weight: 700; }
                      .logo-sub { font-family: 'Dancing Script', cursive; font-size: 16px; color: rgba(255,255,255,0.8); margin-left: 8px; }
                      .header-right { text-align: right; color: rgba(255,255,255,0.9); font-size: 12px; }
                      .header-right .title { font-size: 18px; font-weight: 700; color: white; margin-bottom: 2px; }

                      .content { padding: 32px 40px; }

                      .client-card {
                        background: white;
                        border-radius: 16px;
                        padding: 20px 24px;
                        margin-bottom: 20px;
                        box-shadow: 0 2px 12px rgba(26,32,53,0.06);
                        display: flex;
                        align-items: center;
                        gap: 16px;
                      }
                      .client-avatar {
                        width: 50px; height: 50px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #667eea, #36d8d0);
                        display: flex; align-items: center; justify-content: center;
                        color: white; font-size: 22px; font-weight: 700;
                        flex-shrink: 0;
                      }
                      .client-details { flex: 1; font-size: 13px; color: #6e7a91; }
                      .client-name { font-size: 18px; font-weight: 700; color: #1a2035; margin-bottom: 8px; }
                      .client-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
                      .client-field { padding: 8px 12px; border: 1px solid #edf1f7; font-size: 12px; color: #6e7a91; }
                      .client-field:nth-child(odd) { background: #fafbfe; }
                      .client-field:nth-child(even) { background: #f5f0fa; }
                      .client-field:first-child { border-radius: 8px 0 0 0; }
                      .client-field:nth-child(2) { border-radius: 0 8px 0 0; }
                      .client-field:nth-last-child(2) { border-radius: 0 0 0 8px; }
                      .client-field:last-child { border-radius: 0 0 8px 0; }
                      .client-field .field-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #b0b8c9; font-weight: 600; margin-bottom: 2px; }
                      .client-field .field-value { font-weight: 500; color: #1a2035; }

                      .debt-card {
                        background: white;
                        border-radius: 16px;
                        padding: 24px;
                        margin-bottom: 24px;
                        text-align: center;
                        box-shadow: 0 2px 12px rgba(26,32,53,0.06);
                        border-left: 4px solid ${cDebt > 0 ? '#e53e3e' : '#38a169'};
                      }
                      .debt-label { font-size: 11px; color: #6e7a91; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin-bottom: 6px; }
                      .debt-value { font-size: 32px; font-weight: 800; color: ${cDebt > 0 ? '#e53e3e' : '#38a169'}; }

                      .section-title { font-size: 15px; font-weight: 700; color: #1a2035; margin-bottom: 12px; }

                      .table-card {
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 2px 12px rgba(26,32,53,0.06);
                      }
                      table { width: 100%; border-collapse: collapse; font-size: 13px; }
                      th {
                        background: linear-gradient(135deg, #fbc2eb, #c9a0dc);
                        padding: 12px 16px;
                        text-align: left;
                        font-weight: 600;
                        font-size: 11px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        color: white;
                      }
                      td { padding: 12px 16px; border-bottom: 1px solid #edf1f7; border-right: 1px solid #edf1f7; }
                      td:last-child { border-right: none; }
                      tr:nth-child(odd) td { background: #ffffff; }
                      tr:nth-child(even) td { background: #faf8fd; }
                      tr:last-child td { border-bottom: none; }
                      .buy { color: #e53e3e; font-weight: 600; }
                      .pay { color: #38a169; font-weight: 600; }
                      .obs-text { font-size: 11px; color: #a0aec0; font-style: italic; }

                      .footer {
                        margin-top: 32px;
                        padding: 20px 40px;
                        text-align: center;
                        font-size: 11px;
                        color: #a0aec0;
                        border-top: 2px solid #e8edf5;
                      }
                      .footer .brand { font-family: 'Dancing Script', cursive; font-size: 18px; color: #c9a0dc; margin-bottom: 4px; }

                      @media print {
                        body { background: white; }
                        .header-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .debt-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .client-avatar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      }
                    </style></head><body>

                    <div class="header-bar">
                      <div><span class="logo">Mattos</span><span class="logo-sub">store</span></div>
                      <div class="header-right">
                        <div class="title">Extrato do Cliente</div>
                        <div>${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>

                    <div class="content">
                      <div class="client-card">
                        <div class="client-avatar">${selected.name.charAt(0).toUpperCase()}</div>
                        <div class="client-details">
                          <div class="client-name">${selected.name}</div>
                          <div class="client-fields">
                            <div class="client-field"><div class="field-label">CPF</div><div class="field-value">${selected.cpf || '—'}</div></div>
                            <div class="client-field"><div class="field-label">Telefone</div><div class="field-value">${selected.phone || '—'}</div></div>
                            <div class="client-field" ${!selected.address ? '' : ''}><div class="field-label">Endereço</div><div class="field-value">${selected.address || '—'}</div></div>
                            <div class="client-field"><div class="field-label">Situação</div><div class="field-value" style="color:${cDebt > 0 ? '#e53e3e' : '#38a169'};font-weight:700">${cDebt > 0 ? 'Com débito' : 'Quitado'}</div></div>
                          </div>
                        </div>
                      </div>

                      <div class="debt-card">
                        <div class="debt-label">${cDebt > 0 ? 'Saldo Devedor' : 'Situação Financeira'}</div>
                        <div class="debt-value">${cDebt > 0 ? fmt(cDebt) : 'Quitado'}</div>
                      </div>

                      <div class="section-title">Histórico de Movimentações</div>
                      <div class="table-card">
                        <table>
                          <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Obs</th><th style="text-align:right">Valor</th></tr></thead>
                          <tbody>
                            ${clientTxs.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:32px;color:#a0aec0">Nenhuma movimentação registrada</td></tr>' : clientTxs.map(t => `<tr>
                              <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                              <td class="${t.type}">${t.type === 'buy' ? 'Compra' : 'Pagamento'}</td>
                              <td>${t.type === 'buy' ? t.product_name + ' × ' + t.quantity : (t.method || '').replace('Cartão de ', '')}</td>
                              <td class="obs-text">${t.obs || '—'}</td>
                              <td class="${t.type}" style="text-align:right;font-weight:700">${t.type === 'buy' ? '+' + fmt(t.total) : '-' + fmt(t.amount)}</td>
                            </tr>`).join('')}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="footer">
                      <div class="brand">Mattos Store</div>
                      <div>Sistema de Controle de Cobrança v1.0</div>
                    </div>
                    </body></html>`;
                  const w = window.open('', '_blank');
                  w.document.write(printContent);
                  w.document.close();
                  w.onload = () => { w.print(); };
                }}>
                  <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="6 9 6 2 18 2 18 9"/>
                    <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                    <rect x="6" y="14" width="12" height="8"/>
                  </svg>
                  Imprimir Extrato (PDF)
                </button>
              </div>
            </div>

            {/* Histórico */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Histórico de Movimentações</span>
                <span className="badge badge-blue">{txs.length} registros</span>
              </div>
              <div className="tx-list">
                {txs.length === 0 && (
                  <div className="empty-state" style={{ padding: 32 }}>
                    <div className="empty-state-icon">📋</div>
                    <div className="empty-state-text">Nenhuma movimentação registrada</div>
                  </div>
                )}
                {txs.map(t => (
                  <div key={t.id} className="tx-item">
                    <div className={`tx-icon ${t.type === 'buy' ? 'buy' : 'pay'}`}>
                      {t.type === 'buy' ? '🛒' : '💰'}
                    </div>
                    <div className="tx-info">
                      <div className="tx-desc">
                        {t.type === 'buy'
                          ? `${t.product_name} × ${t.quantity}`
                          : `Pagamento via ${t.method}`}
                      </div>
                      <div className="tx-date">{fmtDate(t.date)}{t.obs ? ` • ${t.obs}` : ''}</div>
                    </div>
                    <div className={`tx-amount ${t.type === 'buy' ? 'negative' : 'positive'}`}>
                      {t.type === 'buy' ? '+' : '-'}{fmt(t.type === 'buy' ? t.total : t.amount)}
                    </div>
                    <div className="tx-item-actions">
                      <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => setEditTx(t)}>✏️</button>
                      <button className="btn btn-danger btn-sm btn-icon" title="Excluir" onClick={() => {
                        setSecurityModal({
                          title: "Excluir Movimentação",
                          onConfirm: async () => {
                            await store.deleteTransaction(t.id);
                            setSecurityModal(null);
                            toast('Movimentação excluída', 'success');
                          }
                        });
                      }}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modais */}
      {modal === 'add' && (
        <AddClientModal
          onClose={() => setModal(null)}
          onSave={form => {
            store.addClient(form);
            setModal(null);
            toast(`Cliente "${form.name}" cadastrado!`, 'success');
          }}
        />
      )}
      {modal === 'edit' && selected && (
        <EditClientModal
          client={selected}
          onClose={() => setModal(null)}
          onSave={form => {
            store.updateClient(selected.id, form);
            setModal(null);
            toast('Cliente atualizado!', 'success');
          }}
        />
      )}
      {modal === 'buy' && selected && (
        <BuyModal
          products={store.products}
          onClose={() => setModal(null)}
          onSave={form => {
            store.addPurchase(selected.id, form);
            setModal(null);
            toast(`Compra de "${form.productName}" registrada!`, 'success');
          }}
        />
      )}
      {modal === 'pay' && selected && (
        <PayModal
          debt={debt}
          onClose={() => setModal(null)}
          onSave={form => {
            store.addPayment(selected.id, form);
            setModal(null);
            toast(`Pagamento de ${fmt(form.amount)} registrado!`, 'success');
          }}
        />
      )}
      {editTx && (
        <EditTxModal
          tx={editTx}
          products={store.products}
          onClose={() => setEditTx(null)}
          onSave={async (form) => {
            try {
              await store.updateTransaction(editTx.id, form);
              setEditTx(null);
              toast('Movimentação atualizada!', 'success');
            } catch (e) {
              toast('Erro ao atualizar', 'error');
            }
          }}
        />
      )}
      
      {securityModal && (
        <SecurityModal
          title={securityModal.title}
          onConfirm={securityModal.onConfirm}
          onCancel={() => setSecurityModal(null)}
        />
      )}
    </div>
  );
}
