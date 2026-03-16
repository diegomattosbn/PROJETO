const icons = {
  success: '✓',
  error: '✕',
  warning: '⚠',
};

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{icons[t.type] || '•'}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
