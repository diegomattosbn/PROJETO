import React, { useState } from 'react';

export default function SecurityModal({ onConfirm, onCancel, title = "Confirmação de Segurança" }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (password === '1971') {
      onConfirm();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal" style={{ maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h2 className="modal-title" style={{ margin: 0 }}>{title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
            Esta ação é irreversível. Digite a senha mestre para continuar.
          </p>
        </div>
        
        <div className="form-group">
          <input
            type="password"
            className={`form-control ${error ? 'error' : ''}`}
            placeholder="Senha Mestre"
            autoFocus
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            style={{ 
              textAlign: 'center', 
              fontSize: 20, 
              letterSpacing: 8, 
              padding: 12,
              borderColor: error ? 'var(--accent-red)' : undefined
            }}
          />
          {error && (
            <div style={{ color: 'var(--accent-red)', fontSize: 12, textAlign: 'center', marginTop: 8, fontWeight: 600 }}>
              Senha incorreta!
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn btn-secondary w-full" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger w-full" onClick={handleConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  );
}
