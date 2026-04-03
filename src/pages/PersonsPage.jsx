import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import TabBar from '../components/TabBar';
import { SearchIcon, PlusIcon, TrashIcon, MapPinIcon } from '../components/Icons';

const RELATIONSHIPS = [
  'Friend', 'Wife', 'Husband', 'Mother', 'Father', 'Sister', 'Brother',
  'Grandmother', 'Grandfather', 'Son', 'Daughter', 'Cousin', 'Uncle', 'Aunt',
  'Boss', 'Colleague', 'Step-Father', 'Step-Mother', 'Father-in-law', 'Mother-in-law',
];

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const EVENT_EMOJIS = {
  birthday: '🎂',
  anniversary: '💍',
  graduation: '🎓',
  custom: '✨',
  christmas: '🎄',
  valentines_day: '💝',
  mothers_day: '👩',
  fathers_day: '👨',
  new_year: '🎆',
  independence_day: '🇺🇸',
  easter: '🐣',
  thanksgiving: '🦃',
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const emptyAddress = { address_line1: '', address_line2: '', city: '', state: '', zip_code: '', country: 'US' };

function getFixedDateLabel(et) {
  if (et.fixed_month && et.fixed_day) {
    return `${MONTHS[et.fixed_month - 1]} ${et.fixed_day} (fixed)`;
  }
  if (et.is_calculated) {
    const labels = {
      mothers_day: '2nd Sunday in May',
      fathers_day: '3rd Sunday in June',
      easter: 'Varies each year',
      thanksgiving: '4th Thursday in Nov',
    };
    return labels[et.id] || 'Calculated annually';
  }
  return null;
}

function formatMonthDay(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const m = parseInt(parts[parts.length - 2]);
    const d = parseInt(parts[parts.length - 1]);
    if (m && d) return `${MONTHS[m - 1]} ${d}`;
  }
  return dateStr;
}

/* ============================================================
   ADDRESS CARD
   ============================================================ */
function AddressCard({ type, label, address, onChange, expanded, onToggle }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <button type="button" onClick={onToggle} style={{
        width: '100%', padding: '12px 16px', borderRadius: 'var(--ge-radius-sm)',
        border: expanded ? '2px solid var(--ge-teal-500)' : '1.5px dashed var(--ge-sage-400)',
        background: expanded ? 'var(--ge-sage-50)' : 'var(--ge-sage-100)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 600,
        color: expanded ? 'var(--ge-teal-700)' : 'var(--ge-text-secondary)', transition: 'all 0.15s',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1rem' }}>{type === 'residential' ? '🏠' : '🏢'}</span>{label}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)' }}>{expanded ? '✓ Added' : '+ Add'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '12px 0 0' }}>
          <div className="input-group"><input className="input-field" placeholder="Street Address" value={address.address_line1} onChange={(e) => onChange({ ...address, address_line1: e.target.value })} /></div>
          <div className="input-group"><input className="input-field" placeholder="Apt, Suite, Unit (optional)" value={address.address_line2 || ''} onChange={(e) => onChange({ ...address, address_line2: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="input-group" style={{ flex: 2 }}><input className="input-field" placeholder="City" value={address.city} onChange={(e) => onChange({ ...address, city: e.target.value })} /></div>
            <div className="input-group" style={{ flex: 1 }}>
              <select className="input-field" value={address.state} onChange={(e) => onChange({ ...address, state: e.target.value })}>
                <option value="">State</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ flex: 1 }}><input className="input-field" placeholder="Zip" value={address.zip_code} onChange={(e) => onChange({ ...address, zip_code: e.target.value })} /></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   CONTACT INFO MODAL (Step 1)
   ============================================================ */
function ContactInfoModal({ isEdit, initialData, onClose, onContinue, onDelete }) {
  const [form, setForm] = useState({
    full_name: '', nickname: '', relationship: '', notes: '', card_signature: '', is_favorite: false,
  });
  const [showResidential, setShowResidential] = useState(false);
  const [showBusiness, setShowBusiness] = useState(false);
  const [residentialAddr, setResidentialAddr] = useState({ ...emptyAddress });
  const [businessAddr, setBusinessAddr] = useState({ ...emptyAddress });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && initialData) {
      setForm({
        full_name: initialData.full_name || '', nickname: initialData.nickname || '',
        relationship: initialData.relationship || '', notes: initialData.notes || '',
        card_signature: initialData.card_signature || '', is_favorite: initialData.is_favorite || false,
      });
      const res = initialData.person_addresses?.find(a => a.address_type === 'residential');
      const bus = initialData.person_addresses?.find(a => a.address_type === 'business');
      if (res) { setShowResidential(true); setResidentialAddr(res); }
      if (bus) { setShowBusiness(true); setBusinessAddr(bus); }
    }
  }, [initialData, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const addresses = [];
      if (showResidential && residentialAddr.address_line1) addresses.push({ ...residentialAddr, address_type: 'residential', is_default: true });
      if (showBusiness && businessAddr.address_line1) addresses.push({ ...businessAddr, address_type: 'business', is_default: !showResidential });

      let personId;
      let personName = form.full_name;

      if (isEdit) {
        await api.updatePerson(initialData.id, {
          full_name: form.full_name, nickname: form.nickname, relationship: form.relationship,
          notes: form.notes, card_signature: form.card_signature, is_favorite: form.is_favorite,
        });
        personId = initialData.id;
        if (initialData.person_addresses) {
          for (const addr of initialData.person_addresses) await api.deleteAddress(initialData.id, addr.id);
        }
        for (const addr of addresses) await api.addAddress(initialData.id, addr);
      } else {
        const result = await api.createPerson({ ...form, addresses });
        personId = result.id;
      }

      onContinue(personId, personName, isEdit ? initialData.events : []);
    } catch (err) { alert(err.message); }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEdit ? 'Edit Contact' : 'Add New Contact'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group"><input className="input-field" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
          <div className="input-group"><input className="input-field" placeholder="Nickname (optional)" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} /></div>
          <div className="input-group">
            <select className="input-field" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} required>
              <option value="">Select Relationship</option>
              {RELATIONSHIPS.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
            </select>
          </div>

          <div className="toggle-row" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1rem' }}>⭐</span><span>Mark as favorite</span>
            </div>
            <button type="button" className={`toggle ${form.is_favorite ? 'on' : ''}`} onClick={() => setForm({ ...form, is_favorite: !form.is_favorite })} />
          </div>

          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--ge-text-secondary)', marginBottom: 8 }}>Delivery address</label>
          <AddressCard type="residential" label="Residential Address" address={residentialAddr} onChange={setResidentialAddr} expanded={showResidential} onToggle={() => setShowResidential(!showResidential)} />
          <AddressCard type="business" label="Business Address" address={businessAddr} onChange={setBusinessAddr} expanded={showBusiness} onToggle={() => setShowBusiness(!showBusiness)} />

          <div className="input-group" style={{ marginTop: 8 }}>
            <label>How do you want to sign the card?</label>
            <input className="input-field" placeholder='e.g. "Love, Uncle John" or "Your Favorite Grandson"' value={form.card_signature} onChange={(e) => setForm({ ...form, card_signature: e.target.value })} />
          </div>

          <div className="input-group" style={{ marginTop: 8 }}>
            <textarea className="input-field" placeholder="Notes (funny memories, preferences...)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={submitting} style={{ marginTop: 4 }}>
            {submitting ? 'Saving...' : 'Continue to Events'}
          </button>
          <button type="button" className="btn btn-text btn-full" onClick={onClose}>Cancel</button>

          {isEdit && (
            <button type="button" onClick={onDelete} style={{
              width: '100%', padding: '12px', marginTop: 12, background: 'none',
              border: '1.5px solid var(--ge-red)', borderRadius: 'var(--ge-radius-full)',
              color: 'var(--ge-red)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}>Delete Contact</button>
          )}
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   EVENTS MODAL (Step 2)
   ============================================================ */
function EventsModal({ personId, personName, existingEvents, eventTypes, onClose, onSaved }) {
  const [toggled, setToggled] = useState({});
  const [dates, setDates] = useState({});
  const [frequencies, setFrequencies] = useState({});
  const [customName, setCustomName] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingEvents && existingEvents.length > 0) {
      const t = {};
      const d = {};
      const f = {};
      existingEvents.forEach(evt => {
        t[evt.event_type_id] = true;
        if (evt.event_date) {
          const parts = evt.event_date.split('-');
          d[evt.event_type_id] = `${parts[1]}-${parts[2]}`;
        }
        f[evt.event_type_id] = evt.frequency || 'annually';
      });
      setToggled(t);
      setDates(d);
      setFrequencies(f);
    }
  }, [existingEvents]);

  const toggle = (id) => {
    setToggled(prev => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = true;
        if (!frequencies[id]) setFrequencies(prev => ({ ...prev, [id]: 'annually' }));
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const existingTypeIds = new Set((existingEvents || []).map(e => e.event_type_id));
      const newSelectedIds = new Set(Object.keys(toggled));

      // Delete events that were unselected
      if (existingEvents) {
        for (const evt of existingEvents) {
          if (!newSelectedIds.has(evt.event_type_id)) {
            await api.deleteEvent(evt.id);
          }
        }
      }

      // Add new events
      for (const eventTypeId of newSelectedIds) {
        if (!existingTypeIds.has(eventTypeId)) {
          const et = eventTypes.find(t => t.id === eventTypeId);
          const monthDay = dates[eventTypeId];
          let eventDate = null;

          if (monthDay) {
            const today = new Date();
            const year = today.getFullYear();
            const candidate = new Date(`${year}-${monthDay}`);
            const useYear = candidate > today ? year : year + 1;
            eventDate = `${useYear}-${monthDay}`;
          } else if (et?.fixed_month && et?.fixed_day) {
            const today = new Date();
            const year = today.getFullYear();
            const m = String(et.fixed_month).padStart(2, '0');
            const d = String(et.fixed_day).padStart(2, '0');
            const candidate = new Date(`${year}-${m}-${d}`);
            const useYear = candidate > today ? year : year + 1;
            eventDate = `${useYear}-${m}-${d}`;
          }

          const eventName = eventTypeId === 'custom'
            ? customName
            : `${personName}'s ${et?.label || eventTypeId}`;

          await api.createEvent({
            person_id: personId,
            event_name: eventName,
            event_type_id: eventTypeId,
            event_date: eventDate,
            frequency: frequencies[eventTypeId] || 'annually',
          });
        }
      }

      onSaved();
    } catch (err) { alert(err.message); }
    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Events for {personName}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--ge-text-secondary)', marginBottom: 16 }}>
          Choose which occasions to send a card.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {eventTypes.map(et => {
            const isOn = !!toggled[et.id];
            const emoji = EVENT_EMOJIS[et.id] || '📬';
            const fixedLabel = getFixedDateLabel(et);

            return (
              <div key={et.id}>
                <div style={{
                  background: 'var(--ge-sage-100)', borderRadius: 10, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1rem' }}>{emoji}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ge-text-primary)' }}>{et.label}</span>
                  </div>
                  <button type="button" className={`toggle ${isOn ? 'on' : ''}`} onClick={() => toggle(et.id)} />
                </div>

                {isOn && (
                  <div style={{
                    background: 'var(--ge-sage-50)', borderRadius: 10, padding: '10px 14px',
                    margin: '2px 12px 0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 140 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)', minWidth: 32 }}>Date:</span>
                      {fixedLabel ? (
                        <span style={{ fontSize: '0.82rem', color: 'var(--ge-text-muted)', fontWeight: 500 }}>{fixedLabel}</span>
                      ) : et.requires_date_input ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <select className="input-field" style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto', minWidth: 100 }}
                            value={dates[et.id]?.split('-')[0] || ''}
                            onChange={(e) => {
                              const day = dates[et.id]?.split('-')[1] || '01';
                              setDates({ ...dates, [et.id]: `${e.target.value}-${day}` });
                            }}
                          >
                            <option value="">Month</option>
                            {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                          </select>
                          <select className="input-field" style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto', minWidth: 60 }}
                            value={dates[et.id]?.split('-')[1] || ''}
                            onChange={(e) => {
                              const month = dates[et.id]?.split('-')[0] || '01';
                              setDates({ ...dates, [et.id]: `${month}-${e.target.value}` });
                            }}
                          >
                            <option value="">Day</option>
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                              <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
                            ))}
                          </select>
                        </div>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)' }}>Freq:</span>
                      <select className="input-field" style={{ padding: '4px 10px', fontSize: '0.78rem', width: 'auto' }}
                        value={frequencies[et.id] || 'annually'}
                        onChange={(e) => setFrequencies({ ...frequencies, [et.id]: e.target.value })}
                      >
                        <option value="annually">Annually</option>
                        <option value="one_time">One-time</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Custom event */}
          <div>
            <div style={{
              background: 'var(--ge-sage-100)', borderRadius: 10, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            }} onClick={() => {
              setShowCustom(!showCustom);
              if (!showCustom) {
                setToggled(prev => ({ ...prev, custom: true }));
                setFrequencies(prev => ({ ...prev, custom: 'annually' }));
              } else {
                setToggled(prev => { const u = { ...prev }; delete u.custom; return u; });
              }
            }}>
              <span style={{ fontSize: '1rem' }}>✨</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ge-text-primary)' }}>+ Add custom event</span>
            </div>

            {showCustom && (
              <div style={{
                background: 'var(--ge-sage-50)', borderRadius: 10, padding: '12px 14px',
                margin: '2px 12px 0', display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <input className="input-field" placeholder="Event name (e.g. Promotion)" value={customName}
                  onChange={(e) => setCustomName(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)', minWidth: 32 }}>Date:</span>
                  <select className="input-field" style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto', minWidth: 100 }}
                    value={dates.custom?.split('-')[0] || ''}
                    onChange={(e) => {
                      const day = dates.custom?.split('-')[1] || '01';
                      setDates({ ...dates, custom: `${e.target.value}-${day}` });
                    }}
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                  </select>
                  <select className="input-field" style={{ padding: '6px 10px', fontSize: '0.82rem', width: 'auto', minWidth: 60 }}
                    value={dates.custom?.split('-')[1] || ''}
                    onChange={(e) => {
                      const month = dates.custom?.split('-')[0] || '01';
                      setDates({ ...dates, custom: `${month}-${e.target.value}` });
                    }}
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                      <option key={d} value={String(d).padStart(2, '0')}>{d}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)' }}>Freq:</span>
                  <select className="input-field" style={{ padding: '4px 10px', fontSize: '0.78rem', width: 'auto' }}
                    value={frequencies.custom || 'annually'}
                    onChange={(e) => setFrequencies({ ...frequencies, custom: e.target.value })}
                  >
                    <option value="annually">Annually</option>
                    <option value="one_time">One-time</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSave} disabled={submitting} style={{ marginTop: 20 }}>
          {submitting ? 'Saving...' : 'Save Events'}
        </button>
        <button className="btn btn-text btn-full" onClick={onSaved}>Skip for now</button>
      </div>
    </div>
  );
}

/* ============================================================
   PERSONS PAGE
   ============================================================ */
export default function PersonsPage() {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPerson, setEditPerson] = useState(null);
  const [activePersonId, setActivePersonId] = useState(null);
  const [activePersonName, setActivePersonName] = useState('');
  const [activePersonEvents, setActivePersonEvents] = useState([]);

  useEffect(() => {
    loadPersons();
    api.getEventTypes().then(setEventTypes).catch(() => {});
    if (location.state?.addNew) openAddNew();
  }, []);

  async function loadPersons() {
    setLoading(true);
    try {
      const data = await api.getPersons();
      setPersons(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const openAddNew = () => {
    setIsEditMode(false);
    setEditPerson(null);
    setShowContactModal(true);
  };

  const openEdit = async (personId) => {
    try {
      const person = await api.getPerson(personId);
      setEditPerson(person);
      setIsEditMode(true);
      setShowContactModal(true);
    } catch (err) { alert(err.message); }
  };

  const handleContactContinue = (personId, personName, existingEvents) => {
    setShowContactModal(false);
    setActivePersonId(personId);
    setActivePersonName(personName);
    setActivePersonEvents(existingEvents || []);
    setShowEventsModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this contact and all their events? This cannot be undone.')) return;
    try {
      await api.deletePerson(editPerson.id);
      setShowContactModal(false);
      setEditPerson(null);
      loadPersons();
    } catch (err) { alert(err.message); }
  };

  const handleEventsSaved = () => {
    setShowEventsModal(false);
    setActivePersonId(null);
    setActivePersonName('');
    setActivePersonEvents([]);
    loadPersons();
  };

  const closeAll = () => {
    setShowContactModal(false);
    setShowEventsModal(false);
    setEditPerson(null);
    setIsEditMode(false);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="app-shell">
      <div className="header-bar">
        <h1>Contacts</h1>
        <button className="header-action"><SearchIcon /></button>
      </div>

      <div className="page-content">
        {persons.length === 0 && !loading ? (
          <div className="empty-state">
            <p>No contacts added yet</p>
            <button className="btn btn-primary" onClick={openAddNew}>Add Your First Contact</button>
          </div>
        ) : (
          <>
            <div className="persons-grid">
              {persons.map((person, i) => (
                <div
                  key={person.id}
                  className="card animate-in"
                  style={{ animationDelay: `${i * 0.05}s`, cursor: 'pointer' }}
                  onClick={() => openEdit(person.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div className="avatar">
                      {person.avatar_url ? <img src={person.avatar_url} alt={person.full_name} /> : getInitials(person.full_name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                        {person.is_favorite && <span style={{ marginRight: 4 }}>⭐</span>}
                        {person.full_name}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ge-teal-600)', fontWeight: 600 }}>{person.relationship}</span>

                      {person.person_addresses?.map((addr, idx) => (
                        <p key={idx} style={{ fontSize: '0.78rem', color: 'var(--ge-text-muted)', marginTop: 4, display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--ge-orange)', flexShrink: 0, width: 14, marginTop: 1 }}><MapPinIcon /></span>
                          <span>
                            {addr.address_type === 'business' && <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase' }}>Work: </span>}
                            {addr.address_line1}, {addr.city}, {addr.state} {addr.zip_code}
                          </span>
                        </p>
                      ))}

                      {person.events && person.events.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                          {person.events.map(evt => (
                            <span key={evt.id} className="chip">
                              {EVENT_EMOJIS[evt.event_type_id] || '📬'} {evt.event_name?.replace(`${person.full_name}'s `, '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="content-padded" style={{ paddingTop: 8, paddingBottom: 16 }}>
              <button className="btn btn-primary btn-full" onClick={openAddNew}>
                + Add Another Contact
              </button>
            </div>
          </>
        )}
      </div>

      <button className="fab" onClick={openAddNew}><PlusIcon /></button>

      {showContactModal && (
        <ContactInfoModal
          isEdit={isEditMode}
          initialData={editPerson}
          onClose={closeAll}
          onContinue={handleContactContinue}
          onDelete={handleDelete}
        />
      )}

      {showEventsModal && (
        <EventsModal
          personId={activePersonId}
          personName={activePersonName}
          existingEvents={activePersonEvents}
          eventTypes={eventTypes}
          onClose={handleEventsSaved}
          onSaved={handleEventsSaved}
        />
      )}

      <TabBar />
    </div>
  );
}
