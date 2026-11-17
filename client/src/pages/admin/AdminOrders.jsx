import { useEffect, useState } from 'react';
import { Search, Eye, X, Truck, Package, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader, ErrorState, EmptyState, StatusBadge } from '../../components/Common';
import { formatDate, formatRWF, getImage } from '../../utils/helpers';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrders = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    setLoading(true);
    ordersAPI.all({ status, search })
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, search]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      await ordersAPI.updateStatus(id, { status: newStatus });
      toast(`Order marked as ${newStatus}`);
      setSelected(null);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setUpdating(false); }
  };

  const remove = async (order) => {
    if (!window.confirm(`Delete order ${order.orderNumber}?`)) return;
    try {
      await ordersAPI.delete(order._id);
      toast('Order deleted');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><span className="eyebrow">Fulfilment</span><h1>Orders</h1><p>Review, update and deliver customer orders.</p></div>
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <label className="admin-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order no. or customer..." /></label>
          <div className="filter-tabs">
            {STATUSES.map((s) => <button key={s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>{s}</button>)}
          </div>
          <span className="admin-toolbar__count">{orders.length} orders</span>
        </div>

        {loading ? <Loader label="Loading orders..." /> : error ? <ErrorState message={error} onRetry={load} /> : orders.length === 0 ? (
          <EmptyState title="No orders here" message="Orders will appear here as customers check out." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>{order.orderNumber}</strong><small className="table-sub">{order.paymentMethod?.replace(/-/g, ' ')}</small></td>
                    <td><div className="admin-table__customer"><span>{order.customer?.name?.charAt(0).toUpperCase()}</span><div><strong>{order.customer?.name}</strong><small>{order.customer?.email}</small></div></div></td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td><strong>{formatRWF(order.pricing?.total)}</strong></td>
                    <td><StatusBadge status={order.status} /></td>
                    <td><div className="table-actions"><button onClick={() => setSelected(order)} aria-label="View"><Eye size={16} /></button><button onClick={() => remove(order)} className="danger" aria-label="Delete"><Trash2 size={16} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal modal--large">
            <div className="modal__head">
              <div><span className="eyebrow">Order details</span><h2>{selected.orderNumber}</h2></div>
              <button onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="modal__body order-modal">
              <div className="order-modal__meta">
                <div><small>Placed on</small><strong>{formatDate(selected.createdAt, { weekday: 'long' })}</strong></div>
                <div><small>Total</small><strong>{formatRWF(selected.pricing?.total)}</strong></div>
                <div><small>Status</small><StatusBadge status={selected.status} /></div>
              </div>

              <div className="order-modal__grid">
                <div>
                  <h4><Package size={16} /> Items</h4>
                  {selected.items.map((item, i) => (
                    <div className="order-modal__item" key={i}>
                      <img src={getImage(item, i)} alt="" />
                      <div><strong>{item.name}</strong><small>{formatRWF(item.price)} × {item.quantity}</small></div>
                      <strong>{formatRWF(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                  <div className="order-modal__totals">
                    <div><span>Subtotal</span><strong>{formatRWF(selected.pricing?.subtotal)}</strong></div>
                    <div><span>Delivery</span><strong>{formatRWF(selected.pricing?.shippingFee)}</strong></div>
                    <div><span>Total</span><strong>{formatRWF(selected.pricing?.total)}</strong></div>
                  </div>
                </div>
                <div>
                  <h4><Truck size={16} /> Delivery</h4>
                  <p className="order-modal__address"><MapPin size={15} /> {selected.shipping?.address}, {selected.shipping?.district ? `${selected.shipping.district}, ` : ''}{selected.shipping?.city}, {selected.shipping?.country}</p>
                  <p><strong>{selected.customer?.name}</strong></p>
                  <p><Mail size={14} /> {selected.customer?.email}</p>
                  <p><Phone size={14} /> {selected.customer?.phone}</p>
                  {selected.shipping?.notes && <p className="muted">Note: {selected.shipping.notes}</p>}

                  <h4 className="order-modal__timeline-title">Timeline</h4>
                  <div className="mini-timeline">
                    {selected.timeline?.map((event, i) => (
                      <div key={i}><span /><div><strong>{event.status}</strong><small>{event.note}</small><small>{formatDate(event.date)}</small></div></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-modal__status-actions">
                <h4>Update status</h4>
                <div className="status-actions">
                  {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                    <button key={s} disabled={updating || s === selected.status} className={`status-btn status-btn--${s.toLowerCase()} ${s === selected.status ? 'active' : ''}`} onClick={() => updateStatus(selected._id, s)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
