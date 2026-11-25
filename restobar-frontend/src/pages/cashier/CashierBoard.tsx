import axios from 'axios';
import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import api from '../../api/axiosInstance';
import { useSocketContext } from '../../context/SocketContext';

type PaymentMethod = 'CASH' | 'POS_DEBIT' | 'POS_CREDIT' | 'TRANSFER' | 'MIXED' | '';
type CashierTab = 'tables' | 'receipts' | 'close';

interface CashierOrder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: { id: string; quantity: number; unitPrice: number; notes?: string; product: { name: string } }[];
}

interface ChargeableTable {
  id: string;
  number: number;
  orders: CashierOrder[];
  items: { productId: string; name: string; quantity: number; unitPrice: number; subtotal: number }[];
  totalAmount: number;
}

interface CashSale {
  id: string;
  source: 'CASH_SALE' | 'PAYMENT';
  table: { number: number };
  amount: number;
  paymentMethod: Exclude<PaymentMethod, ''> | null;
  referenceNum: string | null;
  isReconciled: boolean;
  createdAt: string;
  orders: { order: { id: string; items: CashierOrder['items'] } }[];
}

interface Summary {
  from: string;
  to: string;
  salesCount: number;
  totalAmount: number;
  byMethod: Record<string, { count: number; total: number }>;
}

interface SaleDraft {
  paymentMethod: PaymentMethod;
  referenceNum: string;
}

const methodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  POS_DEBIT: 'Débito / Transbank',
  POS_CREDIT: 'Crédito / Transbank',
  TRANSFER: 'Transferencia',
  MIXED: 'Mixto',
  UNASSIGNED: 'Pendiente de cuadratura',
};

const localDate = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] || character));

const printDocument = (title: string, body: string) => {
  const printWindow = window.open('', '_blank', 'width=760,height=900');
  if (!printWindow) return false;
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page{margin:16mm}body{font:14px Arial,sans-serif;color:#111;margin:0}h1,h2,p{margin:0 0 10px}header{border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:16px}.meta{color:#444}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{text-align:left;padding:8px 4px;border-bottom:1px solid #ddd}.number{text-align:right}.total{font-size:24px;font-weight:bold;text-align:right;border-top:2px solid #111;padding-top:12px}.orders{margin-top:12px;font-size:12px;color:#444}@media print{button{display:none}}
  </style></head><body>${body}<script>window.onload=()=>{window.focus();window.print();};</script></body></html>`);
  printWindow.document.close();
  return true;
};

export const CashierBoard: FC = () => {
  const { socket } = useSocketContext();
  const [activeTab, setActiveTab] = useState<CashierTab>('tables');
  const [tables, setTables] = useState<ChargeableTable[]>([]);
  const [sales, setSales] = useState<CashSale[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [fromDate, setFromDate] = useState(localDate());
  const [toDate, setToDate] = useState(localDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [payingTable, setPayingTable] = useState<ChargeableTable | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [paymentReference, setPaymentReference] = useState('');
  const [savingTableId, setSavingTableId] = useState<string | null>(null);
  const [saleDrafts, setSaleDrafts] = useState<Record<string, SaleDraft>>({});
  const [savingSaleId, setSavingSaleId] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const loadTables = useCallback(async () => {
    const { data } = await api.get<ChargeableTable[]>('/cashier/tables');
    setTables(Array.isArray(data) ? data : []);
  }, []);

  const loadSales = useCallback(async () => {
    const { data } = await api.get<CashSale[]>('/cashier/sales', { params: { from: fromDate, to: toDate } });
    const loaded: CashSale[] = Array.isArray(data) ? data : [];
    setSales(loaded);
    setSaleDrafts(Object.fromEntries(loaded.map((sale) => [sale.id, {
      paymentMethod: sale.paymentMethod || '',
      referenceNum: sale.referenceNum || '',
    }])));
  }, [fromDate, toDate]);

  const loadSummary = useCallback(async () => {
    const { data } = await api.get<Summary>('/cashier/summary', { params: { from: fromDate, to: toDate } });
    setSummary(data);
  }, [fromDate, toDate]);

  const reloadAll = useCallback(async () => {
    setError('');
    try {
      await Promise.all([loadTables(), loadSales(), loadSummary()]);
    } catch (cause) {
      console.error('Error cargando dashboard de caja:', cause);
      setError('No se pudo cargar la información de caja. Revisa la conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [loadSales, loadSummary, loadTables]);

  useEffect(() => { void reloadAll(); }, [reloadAll]);

  useEffect(() => {
    if (!socket) return;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleTableRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => { void loadTables(); }, 200);
    };
    const onSaleCreated = (sale: CashSale) => {
      const saleDay = localDate(new Date(sale.createdAt));
      if (saleDay >= fromDate && saleDay <= toDate) {
        setSales((current) => [sale, ...current.filter((entry) => entry.id !== sale.id)]);
      }
      scheduleTableRefresh();
      void loadSummary();
    };
    const onSaleUpdated = (sale: Partial<CashSale> & { id: string }) => {
      setSales((current) => current.map((entry) => entry.id === sale.id ? { ...entry, ...sale } as CashSale : entry));
      void loadSummary();
    };
    const onOrderUpdated = () => scheduleTableRefresh();
    const onLegacyPaid = ({ order, payment }: { order: CashierOrder & { table: { number: number } }; payment: { id: string; amount: number; paymentMethod: CashSale['paymentMethod']; referenceNum: string | null; createdAt: string } }) => {
      const record: CashSale = {
        id: payment.id,
        source: 'PAYMENT',
        table: order.table,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        referenceNum: payment.referenceNum,
        isReconciled: true,
        createdAt: payment.createdAt,
        orders: [{ order }],
      };
      const saleDay = localDate(new Date(record.createdAt));
      if (saleDay >= fromDate && saleDay <= toDate) {
        setSales((current) => [record, ...current.filter((sale) => sale.id !== record.id)]);
      }
      scheduleTableRefresh();
      void loadSummary();
    };

    socket.on('cashier:sale_created', onSaleCreated);
    socket.on('cashier:sale_updated', onSaleUpdated);
    socket.on('order:created', onOrderUpdated);
    socket.on('order:status_updated', onOrderUpdated);
    socket.on('order:paid', onLegacyPaid);
    socket.on('cashier:tables_updated', onOrderUpdated);
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      socket.off('cashier:sale_created', onSaleCreated);
      socket.off('cashier:sale_updated', onSaleUpdated);
      socket.off('order:created', onOrderUpdated);
      socket.off('order:status_updated', onOrderUpdated);
      socket.off('order:paid', onLegacyPaid);
      socket.off('cashier:tables_updated', onOrderUpdated);
    };
  }, [socket, loadTables, loadSummary, fromDate, toDate]);

  const totalOpen = useMemo(() => tables.reduce((total, table) => total + table.totalAmount, 0), [tables]);

  const openPayment = (table: ChargeableTable) => {
    setPayingTable(table);
    setPaymentMethod('');
    setPaymentReference('');
    setFeedback('');
  };

  const chargeTable = async () => {
    if (!payingTable) return;
    if (!window.confirm(`¿Cobrar $${payingTable.totalAmount.toLocaleString()} y liberar la Mesa #${payingTable.number}?`)) return;
    try {
      setSavingTableId(payingTable.id);
      const { data } = await api.post(`/cashier/tables/${payingTable.id}/pay`, {
        paymentMethod: paymentMethod || null,
        referenceNum: paymentReference.trim() || null,
      });
      setTables((current) => current.filter((table) => table.id !== payingTable.id));
      const newSale = data as CashSale;
      const saleDay = localDate(new Date(newSale.createdAt));
      if (saleDay >= fromDate && saleDay <= toDate) {
        setSales((current) => [newSale, ...current.filter((sale) => sale.id !== newSale.id)]);
      }
      setPayingTable(null);
      setFeedback(`Mesa #${payingTable.number} cobrada y liberada. Se agregó el cobro a cuadratura.`);
      await loadSummary();
    } catch (cause) {
      console.error('Error cobrando mesa:', cause);
      setFeedback(axios.isAxiosError(cause)
        ? cause.response?.data?.message || 'No se pudo cobrar la mesa. Actualiza los datos e inténtalo nuevamente.'
        : 'No se pudo cobrar la mesa. Actualiza los datos e inténtalo nuevamente.');
    } finally {
      setSavingTableId(null);
    }
  };

  const saveSalePayment = async (sale: CashSale) => {
    const draft = saleDrafts[sale.id] || { paymentMethod: sale.paymentMethod || '', referenceNum: sale.referenceNum || '' };
    try {
      setSavingSaleId(sale.id);
      const { data } = await api.patch(`/cashier/sales/${sale.id}/payment`, {
        paymentMethod: draft.paymentMethod || null,
        referenceNum: draft.referenceNum,
      });
      setSales((current) => current.map((entry) => entry.id === sale.id ? { ...entry, ...data } : entry));
      setFeedback(`Boleta de Mesa #${sale.table.number} actualizada.`);
      await loadSummary();
    } catch (cause) {
      console.error('Error actualizando método de pago:', cause);
      setFeedback(axios.isAxiosError(cause)
        ? cause.response?.data?.message || 'No se pudo guardar el método o referencia del cobro.'
        : 'No se pudo guardar el método o referencia del cobro.');
    } finally {
      setSavingSaleId(null);
    }
  };

  const updateDraft = (sale: CashSale, field: keyof SaleDraft, value: string) => {
    setSaleDrafts((current) => ({
      ...current,
      [sale.id]: {
        ...(current[sale.id] || { paymentMethod: sale.paymentMethod || '', referenceNum: sale.referenceNum || '' }),
        [field]: value,
      },
    }));
  };

  const printTable = (table: ChargeableTable) => {
    const rows = table.items.map((item) => `<tr><td>${item.quantity}× ${escapeHtml(item.name)}</td><td class="number">$${(item.subtotal).toLocaleString()}</td></tr>`).join('');
    const orderDetails = table.orders.map((order) => `<div>Comanda ${escapeHtml(order.id.slice(0, 8))} · ${escapeHtml(order.status)}</div>`).join('');
    const body = `<header><h1>BiandeR Restobar</h1><h2>Cuenta · Mesa #${table.number}</h2><p class="meta">${new Date().toLocaleString()}</p></header><table><thead><tr><th>Detalle</th><th class="number">Subtotal</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total consumido: $${table.totalAmount.toLocaleString()}</div><div class="orders">${orderDetails}</div>`;
    if (!printDocument(`Cuenta Mesa ${table.number}`, body)) setFeedback('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes e inténtalo otra vez.');
  };

  const printClose = () => {
    if (!summary) return;
    const rows = Object.entries(summary.byMethod).map(([method, value]) => `<tr><td>${escapeHtml(methodLabels[method] || method)}</td><td>${value.count}</td><td class="number">$${value.total.toLocaleString()}</td></tr>`).join('');
    const body = `<header><h1>BiandeR Restobar</h1><h2>Cierre de Caja</h2><p class="meta">${escapeHtml(fromDate)}${fromDate !== toDate ? ` a ${escapeHtml(toDate)}` : ''} · Impreso ${new Date().toLocaleString()}</p></header><p>Ventas: ${summary.salesCount}</p><table><thead><tr><th>Método</th><th>Ventas</th><th class="number">Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total general: $${summary.totalAmount.toLocaleString()}</div>`;
    if (!printDocument('Cierre de caja', body)) setFeedback('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes e inténtalo otra vez.');
  };

  const registerClose = async () => {
    if (!window.confirm('¿Registrar el cierre de caja para el período seleccionado?')) return;
    try {
      setClosing(true);
      const { data } = await api.post('/cashier/close', { from: fromDate, to: toDate });
      setSummary(data.summary);
      setFeedback(`Cierre registrado correctamente · ${data.summary.salesCount} ventas · $${data.summary.totalAmount.toLocaleString()}.`);
    } catch (cause) {
      console.error('Error registrando cierre:', cause);
      setFeedback(axios.isAxiosError(cause)
        ? cause.response?.data?.message || 'No se pudo registrar el cierre de caja.'
        : 'No se pudo registrar el cierre de caja.');
    } finally {
      setClosing(false);
    }
  };

  const tabs: { id: CashierTab; label: string; count?: number }[] = [
    { id: 'tables', label: 'Mesas por cobrar', count: tables.length },
    { id: 'receipts', label: 'Boletas y métodos', count: sales.length },
    { id: 'close', label: 'Cierre de caja' },
  ];

  return (
    <main style={{ padding: 'clamp(12px, 3vw, 28px)', fontFamily: 'sans-serif', maxWidth: 1500, margin: '0 auto', minWidth: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div><h1 style={{ marginBottom: 4 }}>Caja</h1><p style={{ marginTop: 0, color: '#4b5563' }}>Consumo por mesa, cobros y cuadratura del turno.</p></div>
        <button onClick={() => void reloadAll()} disabled={loading} style={buttonStyle}>{loading ? 'Actualizando…' : 'Actualizar'}</button>
      </header>
      {feedback && <p role="status" style={feedbackStyle}>{feedback}</p>}
      {error && <p role="alert" style={{ ...feedbackStyle, color: '#991b1b', background: '#fee2e2' }}>{error}</p>}

      <nav aria-label="Secciones de caja" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '20px 0' }}>
        {tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-pressed={activeTab === tab.id} style={{ ...tabStyle, background: activeTab === tab.id ? '#111827' : '#fff', color: activeTab === tab.id ? '#fff' : '#111827' }}>{tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}</button>)}
      </nav>

      {loading ? <p>Cargando caja…</p> : activeTab === 'tables' ? (
        <section>
          <div style={summaryBanner}><span>Consumo pendiente en mesas</span><strong style={{ fontSize: 25 }}>${totalOpen.toLocaleString()}</strong></div>
          {tables.length === 0 ? <p>No hay mesas por cobrar.</p> : (
            <div style={gridStyle}>
              {tables.map((table) => (
                <article key={table.id} style={cardStyle}>
                  <h2 style={{ marginTop: 0 }}>Mesa #{table.number}</h2>
                  <p>{table.orders.length} {table.orders.length === 1 ? 'comanda' : 'comandas'} pendientes</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={tableStyle}>
                      <thead><tr><th>Producto</th><th>Cant.</th><th>Subtotal</th></tr></thead>
                      <tbody>{table.items.map((item, index) => <tr key={`${item.productId}-${item.unitPrice}-${index}`}><td>{item.name}</td><td>{item.quantity}</td><td>${item.subtotal.toLocaleString()}</td></tr>)}</tbody>
                    </table>
                  </div>
                  <details style={{ margin: '10px 0' }}>
                    <summary>Ver comandas incluidas</summary>
                    <ul>{table.orders.map((order) => <li key={order.id}>#{order.id.slice(0, 8)} · {order.status} · ${order.totalAmount.toLocaleString()}</li>)}</ul>
                  </details>
                  <p style={{ margin: '16px 0', paddingTop: 12, borderTop: '2px solid #111827', fontSize: 21, fontWeight: 800 }}>Total consumido: ${table.totalAmount.toLocaleString()}</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => printTable(table)} style={buttonStyle}>Imprimir Total / Cuenta</button>
                    <button onClick={() => openPayment(table)} style={{ ...buttonStyle, background: '#15803d', color: '#fff', borderColor: '#15803d' }}>Cobrar y Liberar Mesa</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : activeTab === 'receipts' ? (
        <section>
          <DateRange fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} />
          {sales.length === 0 ? <p>No hay cobros registrados en el período.</p> : (
            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              {sales.map((sale) => {
                const draft = saleDrafts[sale.id] || { paymentMethod: sale.paymentMethod || '', referenceNum: sale.referenceNum || '' };
                return (
                  <article key={`${sale.source}-${sale.id}`} style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div><h2 style={{ margin: '0 0 4px' }}>Mesa #{sale.table.number}</h2><span style={{ color: '#4b5563' }}>{new Date(sale.createdAt).toLocaleString()} · {sale.orders.length} comandas</span></div>
                      <strong style={{ fontSize: 22 }}>${sale.amount.toLocaleString()}</strong>
                    </div>
                    <details style={{ margin: '12px 0' }}><summary>Detalle de productos</summary><ul>{sale.orders.flatMap(({ order }) => order.items.map((item) => <li key={`${order.id}-${item.id}`}>{item.quantity}× {item.product.name}</li>))}</ul></details>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: 10, alignItems: 'end' }}>
                      <label style={labelStyle}>Método de pago
                        <select value={draft.paymentMethod} onChange={(event) => updateDraft(sale, 'paymentMethod', event.target.value)} style={inputStyle}>
                          <option value="">Pendiente de cuadratura</option>
                          <option value="CASH">Efectivo</option>
                          <option value="POS_DEBIT">Débito / Transbank</option>
                          <option value="POS_CREDIT">Crédito / Transbank</option>
                          <option value="TRANSFER">Transferencia</option>
                          <option value="MIXED">Mixto</option>
                        </select>
                      </label>
                      <label style={labelStyle}>N° de boleta / referencia
                        <input value={draft.referenceNum} onChange={(event) => updateDraft(sale, 'referenceNum', event.target.value)} placeholder="Opcional" style={inputStyle} />
                      </label>
                      <button onClick={() => void saveSalePayment(sale)} disabled={savingSaleId === sale.id} style={buttonStyle}>{savingSaleId === sale.id ? 'Guardando…' : 'Guardar cuadratura'}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section>
          <DateRange fromDate={fromDate} toDate={toDate} setFromDate={setFromDate} setToDate={setToDate} />
          {summary && <>
            <div style={{ ...gridStyle, marginTop: 18 }}>
              {Object.entries(summary.byMethod).map(([method, value]) => (
                <article key={method} style={cardStyle}><h3 style={{ marginTop: 0 }}>{methodLabels[method] || method}</h3><p>{value.count} {value.count === 1 ? 'venta' : 'ventas'}</p><strong style={{ fontSize: 21 }}>${value.total.toLocaleString()}</strong></article>
              ))}
            </div>
            <article style={{ ...cardStyle, marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div><p style={{ margin: '0 0 4px' }}>Ventas registradas: {summary.salesCount}</p><strong style={{ fontSize: 25 }}>Total general: ${summary.totalAmount.toLocaleString()}</strong></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={printClose} style={buttonStyle}>Imprimir cierre</button>
                <button onClick={() => void registerClose()} disabled={closing} style={{ ...buttonStyle, color: '#fff', background: '#111827' }}>{closing ? 'Registrando…' : 'Registrar cierre de caja'}</button>
              </div>
            </article>
          </>}
        </section>
      )}

      {payingTable && (
        <div role="presentation" style={modalBackdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && savingTableId !== payingTable.id) setPayingTable(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="payment-title" style={modalStyle}>
            <h2 id="payment-title" style={{ marginTop: 0 }}>Cobrar Mesa #{payingTable.number}</h2>
            <p>Total: <strong>${payingTable.totalAmount.toLocaleString()}</strong></p>
            <label style={labelStyle}>Método inicial (opcional; también puedes cuadrarlo después)
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} style={inputStyle}>
                <option value="">Pendiente de cuadratura</option>
                <option value="CASH">Efectivo</option>
                <option value="POS_DEBIT">Débito / Transbank</option>
                <option value="POS_CREDIT">Crédito / Transbank</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="MIXED">Mixto</option>
              </select>
            </label>
            <label style={{ ...labelStyle, marginTop: 12 }}>Referencia / boleta
              <input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} style={inputStyle} />
            </label>
            <div style={{ display: 'flex', justifyContent: 'end', gap: 8, marginTop: 18 }}>
              <button onClick={() => setPayingTable(null)} disabled={savingTableId === payingTable.id} style={buttonStyle}>Cancelar</button>
              <button onClick={() => void chargeTable()} disabled={savingTableId === payingTable.id} style={{ ...buttonStyle, background: '#15803d', color: '#fff', borderColor: '#15803d' }}>{savingTableId === payingTable.id ? 'Cobrando…' : 'Confirmar cobro y liberar'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

const DateRange = ({ fromDate, toDate, setFromDate, setToDate }: { fromDate: string; toDate: string; setFromDate: (value: string) => void; setToDate: (value: string) => void }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end', padding: 14, background: '#f3f4f6', borderRadius: 10 }}>
    <label style={labelStyle}>Desde<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} style={inputStyle} /></label>
    <label style={labelStyle}>Hasta<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} style={inputStyle} /></label>
  </div>
);

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 16 };
const cardStyle = { border: '1px solid #d1d5db', borderRadius: 12, padding: 18, background: '#fff', minWidth: 0, boxShadow: '0 2px 8px rgba(0,0,0,.04)' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const };
const summaryBanner = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const, padding: 18, marginBottom: 16, color: '#14532d', background: '#dcfce7', borderRadius: 12 };
const buttonStyle = { padding: '11px 14px', minHeight: 44, borderRadius: 8, border: '1px solid #9ca3af', background: '#fff', color: '#111827', cursor: 'pointer', fontWeight: 700 as const };
const tabStyle = { ...buttonStyle, borderRadius: 999, paddingLeft: 16, paddingRight: 16 };
const labelStyle = { display: 'grid', gap: 6, minWidth: 0, fontSize: 14, fontWeight: 600 as const };
const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: 10, border: '1px solid #9ca3af', borderRadius: 6, background: '#fff' };
const feedbackStyle = { padding: 12, borderRadius: 8, background: '#eff6ff', color: '#1e3a8a' };
const modalBackdrop = { position: 'fixed' as const, inset: 0, zIndex: 50, display: 'grid', placeItems: 'center', padding: 16, background: 'rgba(0,0,0,.5)' };
const modalStyle = { width: 'min(100%, 480px)', padding: 22, borderRadius: 12, background: '#fff', boxShadow: '0 16px 48px rgba(0,0,0,.24)' };

export default CashierBoard;
