import React, { useState, useMemo } from 'react';
import SecurityModal from '../components/SecurityModal';

const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function Products({ store, toast }) {
  const [form, setForm] = useState({ name: '', stock: '', price: '' });
  const [editing, setEditing] = useState(null); // { id, name, stock, price }
  const [securityModal, setSecurityModal] = useState(null); // { title, onConfirm }
  const [searchProduct, setSearchProduct] = useState('');
  const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const updateEdit = k => e => setEditing(p => ({ ...p, [k]: e.target.value }));

  const handleAdd = async () => {
    if (!form.name.trim() || !form.stock || !form.price) return;
    try {
      await store.addProduct({ name: form.name.trim(), stock: Number(form.stock), price: Number(form.price) });
      setForm({ name: '', stock: '', price: '' });
      toast(`Produto "${form.name}" cadastrado!`, 'success');
    } catch (e) {
      toast('Erro ao cadastrar produto', 'error');
    }
  };

  const handleSaveEdit = async () => {
    if (!editing.name.trim()) return;
    try {
      await store.updateProduct(editing.id, { name: editing.name.trim(), stock: Number(editing.stock), price: Number(editing.price) });
      setEditing(null);
      toast('Produto atualizado!', 'success');
    } catch (e) {
      toast('Erro ao atualizar produto', 'error');
    }
  };

  const LOW_STOCK = 5;

  const filteredProducts = useMemo(() =>
    store.products.filter(p => p.name.toLowerCase().includes(searchProduct.toLowerCase())),
    [store.products, searchProduct]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Formulário de Cadastro */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Novo Produto</span>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
            <label className="form-label">Nome do Produto *</label>
            <input className="form-control" value={form.name} onChange={update('name')} placeholder="Ex: Arroz 5kg" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
            <label className="form-label">Qtd. em Estoque *</label>
            <input type="number" className="form-control" value={form.stock} onChange={update('stock')} placeholder="0" min={0} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
            <label className="form-label">Valor de Venda (R$) *</label>
            <input type="number" className="form-control" value={form.price} onChange={update('price')} placeholder="0,00" step="0.01" min={0} />
          </div>
          <button className="btn btn-primary" onClick={handleAdd} style={{ flexShrink: 0 }}>
            + Cadastrar
          </button>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Produtos Cadastrados</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filteredProducts.length} de {store.products.length} itens</span>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-main)', border: '1.5px solid var(--border)', borderRadius: 50, padding: '10px 18px' }}>
            <svg width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              value={searchProduct}
              onChange={e => setSearchProduct(e.target.value)}
              placeholder="Pesquisar produto..."
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)', width: '100%' }}
            />
            {searchProduct && (
              <button onClick={() => setSearchProduct('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, padding: 0 }}>✕</button>
            )}
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Estoque</th>
                <th>Valor Unit.</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 && (
                <tr><td colSpan={5}><div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-text">{searchProduct ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}</div></div></td></tr>
              )}
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  {editing?.id === p.id ? (
                    <>
                      <td><input className="form-control" value={editing.name} onChange={updateEdit('name')} style={{ padding: '6px 10px' }} /></td>
                      <td><input type="number" className="form-control" value={editing.stock} onChange={updateEdit('stock')} style={{ padding: '6px 10px', width: 80 }} min={0} /></td>
                      <td><input type="number" className="form-control" value={editing.price} onChange={updateEdit('price')} style={{ padding: '6px 10px', width: 100 }} step="0.01" min={0} /></td>
                      <td>—</td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-primary btn-sm" onClick={handleSaveEdit}>✓ Salvar</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}>Cancelar</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: p.stock <= LOW_STOCK ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td>{fmt(p.price)}</td>
                      <td>
                        {p.stock === 0
                          ? <span className="badge badge-red">Esgotado</span>
                          : p.stock <= LOW_STOCK
                            ? <span className="badge badge-orange">Estoque Baixo</span>
                            : <span className="badge badge-green">Disponível</span>
                        }
                      </td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-secondary btn-sm btn-icon" title="Editar" onClick={() => setEditing({ ...p })}>✏️</button>
                          <button className="btn btn-danger btn-sm btn-icon" title="Excluir" onClick={() => {
                            setSecurityModal({
                              title: `Excluir Produto: ${p.name}`,
                              onConfirm: async () => {
                                await store.deleteProduct(p.id);
                                setSecurityModal(null);
                                toast(`Produto "${p.name}" excluído`, 'success');
                              }
                            });
                          }}>🗑️</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
