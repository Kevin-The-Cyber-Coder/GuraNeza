import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle2, Instagram, Facebook } from 'lucide-react';
import { contactsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Breadcrumbs } from '../components/Common';

const Contact = () => {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General enquiry', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await contactsAPI.create(form);
      toast(data.message || 'Message sent!');
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: 'General enquiry', message: '' });
    } catch (err) {
      toast(err.message || 'Could not send your message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-section">
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <div className="contact-page">
        <div className="contact-info">
          <span className="eyebrow">We are here for you</span>
          <h1>Let's talk</h1>
          <p>Have a question about a product, an order, or just want to say hello? Drop us a message and our friendly team will get back to you.</p>

          <div className="contact-info__cards">
            <div><span><MapPin size={20} /></span><div><strong>Visit us</strong><p>Kigali, Rwanda</p></div></div>
            <div><span><Phone size={20} /></span><div><strong>Call us</strong><p>+250 788 000 000</p></div></div>
            <div><span><Mail size={20} /></span><div><strong>Email us</strong><p>hello@guraneza.rw</p></div></div>
            <div><span><Clock size={20} /></span><div><strong>Opening hours</strong><p>Mon–Sat, 8:00 AM – 7:00 PM</p></div></div>
          </div>

          <div className="contact-social">
            <span>Follow along:</span>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="https://wa.me/250788000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
          </div>
        </div>

        <div className="contact-form-card">
          {sent ? (
            <div className="contact-sent">
              <CheckCircle2 size={52} />
              <h2>Message sent!</h2>
              <p>Thanks for reaching out. We have received your message and will reply as soon as we can.</p>
              <button className="btn btn--outline" onClick={() => setSent(false)}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2>Send us a message</h2>
              <p className="contact-form-card__sub">Fill in the details below and we will be in touch.</p>
              <div className="form-grid form-grid--2">
                <label className="field"><span>Your name</span><input required value={form.name} onChange={setField('name')} placeholder="Alice Uwimana" /></label>
                <label className="field"><span>Email address</span><input required type="email" value={form.email} onChange={setField('email')} placeholder="you@example.com" /></label>
                <label className="field"><span>Phone <small>(optional)</small></span><input value={form.phone} onChange={setField('phone')} placeholder="+250 788..." /></label>
                <label className="field"><span>Subject</span>
                  <select value={form.subject} onChange={setField('subject')}>
                    <option>General enquiry</option>
                    <option>Question about an order</option>
                    <option>Product question</option>
                    <option>Returns & refunds</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>
              <label className="field"><span>Your message</span><textarea required rows="6" value={form.message} onChange={setField('message')} placeholder="Tell us how we can help..." /></label>
              <button className="btn btn--primary btn--block btn--lg" disabled={submitting}><Send size={17} /> {submitting ? 'Sending...' : 'Send message'}</button>
            </form>
          )}
        </div>
      </div>

      <div className="contact-faq">
        <h2>Frequently asked questions</h2>
        <div className="faq-grid">
          {[
            { q: 'How long does delivery take?', a: 'Most orders within Kigali are delivered the same day or the next business day, depending on when you order.' },
            { q: 'Can I pay on delivery?', a: 'Yes! Cash on Delivery is available, along with Mobile Money (MTN MoMo, Airtel Money) and bank transfer.' },
            { q: 'Do I need an account to order?', a: 'No. You can shop as a guest. Creating an account simply lets you track orders and check out faster.' },
            { q: 'What if my item arrives damaged?', a: 'Contact us within 7 days of delivery and we will arrange a replacement or refund.' },
          ].map((faq) => (
            <details key={faq.q} className="faq-item"><summary>{faq.q}</summary><p>{faq.a}</p></details>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;
