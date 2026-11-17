import { useEffect, useState } from 'react';
import { Search, Eye, Trash2, X, Mail, Phone, Send, CheckCircle2 } from 'lucide-react';
import { contactsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Loader, ErrorState, EmptyState, StatusBadge } from '../../components/Common';
import { formatDate } from '../../utils/helpers';

const STATUSES = ['All', 'New', 'Read', 'Replied', 'Closed'];

const AdminContacts = () => {
  const toast = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    contactsAPI.all({ status })
      .then((data) => setContacts(data.contacts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const open = async (contact) => {
    try {
      const data = await contactsAPI.get(contact._id);
      setSelected(data.contact);
      setReply(data.contact.reply || '');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const sendReply = async () => {
    if (!reply.trim()) return toast('Write a reply first', 'error');
    setSaving(true);
    try {
      await contactsAPI.update(selected._id, { reply, status: 'Replied' });
      toast('Reply saved successfully');
      setSelected(null);
      load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const setStatusValue = async (value) => {
    try {
      await contactsAPI.update(selected._id, { status: value });
      toast(`Message marked as ${value}`);
      setSelected(null);
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const remove = async (contact) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await contactsAPI.delete(contact._id);
      toast('Message deleted');
      load();
    } catch (err) { toast(err.message, 'error'); }
  };

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q);
  });

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div><span className="eyebrow">Inbox</span><h1>Messages</h1><p>Questions and feedback from your website visitors.</p></div>
      </div>

      <section className="admin-card">
        <div className="admin-toolbar">
          <label className="admin-search"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." /></label>
          <div className="filter-tabs">
            {STATUSES.map((s) => <button key={s} className={status === s ? 'active' : ''} onClick={() => setStatus(s)}>{s}</button>)}
          </div>
        </div>

        {loading ? <Loader label="Loading messages..." /> : error ? <ErrorState message={error} onRetry={load} /> : filtered.length === 0 ? (
          <EmptyState title="Inbox zero!" message="No messages match your filters." />
        ) : (
          <div className="message-list">
            {filtered.map((contact) => (
              <div className={`message-row ${contact.status === 'New' ? 'message-row--new' : ''}`} key={contact._id} onClick={() => open(contact)}>
                <span className="message-row__avatar">{contact.name.charAt(0).toUpperCase()}</span>
                <div className="message-row__content">
                  <div><strong>{contact.name}</strong><StatusBadge status={contact.status} /></div>
                  <p><strong>{contact.subject}</strong> — {contact.message}</p>
                  <small>{contact.email} · {formatDate(contact.createdAt)}</small>
                </div>
                <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => open(contact)} aria-label="View"><Eye size={16} /></button>
                  <button onClick={() => remove(contact)} className="danger" aria-label="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal modal--medium">
            <div className="modal__head">
              <div><span className="eyebrow">Message</span><h2>{selected.subject}</h2></div>
              <button onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button>
            </div>
            <div className="modal__body contact-modal">
              <div className="contact-modal__from">
                <span className="message-row__avatar">{selected.name.charAt(0).toUpperCase()}</span>
                <div><strong>{selected.name}</strong><small>{formatDate(selected.createdAt, { weekday: 'long' })}</small></div>
                <StatusBadge status={selected.status} />
              </div>
              <div className="contact-modal__details">
                <span><Mail size={15} /> {selected.email}</span>
                {selected.phone && <span><Phone size={15} /> {selected.phone}</span>}
              </div>
              <div className="contact-modal__message">{selected.message}</div>

              {selected.reply && (
                <div className="contact-modal__previous"><strong><CheckCircle2 size={15} /> Your reply</strong><p>{selected.reply}</p></div>
              )}

              <div className="contact-modal__reply">
                <label className="field"><span>Reply</span><textarea rows="4" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write your reply here..." /></label>
                <div className="contact-modal__actions">
                  <div>
                    {['Read', 'Replied', 'Closed'].map((s) => (
                      <button key={s} className="btn btn--ghost btn--sm" onClick={() => setStatusValue(s)} disabled={saving}>{s}</button>
                    ))}
                  </div>
                  <button className="btn btn--primary" onClick={sendReply} disabled={saving}><Send size={16} /> {saving ? 'Saving...' : 'Save reply'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
