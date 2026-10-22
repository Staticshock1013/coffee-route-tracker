import { useEffect, useMemo, useState } from 'react'
import { Coffee, MapPin, PackagePlus, Plus, RotateCcw, TrendingUp, X } from 'lucide-react'
import { createRoot } from 'react-dom/client'
import { sampleData } from './sample-data'
import { cupsForLocation, lastRestockDate, restockCostForLocation, revenueForLocation } from './revenue'
import type { CupLog, Location, Restock, RouteData } from './types'
import './styles.css'

const STORAGE_KEY = 'groundwork-route-data'
const displayMonth = 'October 2026'
const reportMonth = '2026-10'
const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const dateLabel = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))
const id = () => crypto.randomUUID()

function App() {
  const [data, setData] = useState<RouteData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : sampleData
  })
  const [modal, setModal] = useState<'location' | 'cups' | 'restock' | null>(null)
  const [editing, setEditing] = useState<Location | null>(null)
  const [activeLocationId, setActiveLocationId] = useState(data.locations[0]?.id ?? '')

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data])

  const report = useMemo(() => data.locations.map((location) => {
    const revenue = revenueForLocation(location, data.cupLogs, reportMonth)
    const restockCost = restockCostForLocation(location.id, data.restocks, reportMonth)
    const cups = cupsForLocation(location.id, data.cupLogs, reportMonth)
    const latest = lastRestockDate(location.id, data.restocks)
    const daysSince = latest ? Math.floor((new Date('2026-10-21').getTime() - new Date(`${latest}T12:00:00`).getTime()) / 86400000) : 999
    return { location, revenue, restockCost, cups, latest, daysSince, due: daysSince >= location.restockCadenceDays }
  }), [data])
  const totalRevenue = report.reduce((total, row) => total + row.revenue, 0)
  const totalCosts = report.reduce((total, row) => total + row.restockCost, 0)
  const maxRevenue = Math.max(...report.map((row) => row.revenue), 1)

  const saveLocation = (location: Location) => {
    setData((current) => ({
      ...current,
      locations: editing ? current.locations.map((item) => item.id === location.id ? location : item) : [...current.locations, location],
    }))
    setActiveLocationId(location.id)
    setEditing(null)
    setModal(null)
  }
  const addCups = (cupLog: CupLog) => {
    setData((current) => ({ ...current, cupLogs: [...current.cupLogs, cupLog] }))
    setModal(null)
  }
  const addRestock = (restock: Restock) => {
    setData((current) => ({ ...current, restocks: [...current.restocks, restock] }))
    setModal(null)
  }
  const reset = () => {
    if (confirm('Restore the fictional sample route? Your saved changes will be replaced.')) setData(sampleData)
  }

  return <main>
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-mark"><Coffee size={20} /></span><span>groundwork<small>COFFEE ROUTE</small></span></a>
      <div className="month-pill"><span></span>{displayMonth}</div>
      <button className="reset-button" onClick={reset}><RotateCcw size={15} /> Reset sample data</button>
    </header>

    <section className="hero">
      <div><p className="eyebrow">ROUTE OVERVIEW</p><h1>Your route, at a glance.</h1><p className="subhead">A calmer way to keep placements profitable and kitchens stocked.</p></div>
      <div className="quick-actions"><button onClick={() => { setEditing(null); setModal('location') }}><Plus size={17} /> Add placement</button><button className="dark" onClick={() => setModal('cups')}><Coffee size={17} /> Log cups</button></div>
    </section>

    <section className="stats">
      <Stat label="MONTHLY REVENUE" value={money(totalRevenue)} note="Across 4 active placements" icon={<TrendingUp size={19} />} />
      <Stat label="RESTOCK COSTS" value={money(totalCosts)} note="4 route stops this month" icon={<PackagePlus size={19} />} />
      <Stat label="SIMPLE PROFIT" value={money(totalRevenue - totalCosts)} note={`${Math.round(((totalRevenue - totalCosts) / totalRevenue) * 100)}% before labor & overhead`} icon={<span className="profit-icon">↗</span>} />
      <Stat label="RESTOCK ATTENTION" value={`${report.filter((row) => row.due).length} stops`} note="Due or overdue this week" icon={<MapPin size={19} />} warm />
    </section>

    <section className="dashboard-grid">
      <div className="panel revenue-panel">
        <div className="panel-heading"><div><p className="eyebrow">PERFORMANCE</p><h2>Revenue by placement</h2></div><span className="period">OCT 2026</span></div>
        <div className="bar-chart">{report.map((row) => <div className="bar-row" key={row.location.id}>
          <div className="bar-label"><strong>{row.location.name}</strong><span>{row.location.pricingModel === 'flat' ? 'Flat monthly' : `${row.cups} cups logged`}</span></div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.max((row.revenue / maxRevenue) * 100, 3)}%` }}></div></div>
          <strong className="bar-value">{money(row.revenue)}</strong>
        </div>)}</div>
        <div className="chart-footer"><span>Highest earner: <strong>{[...report].sort((a, b) => b.revenue - a.revenue)[0]?.location.name}</strong></span><span>{money(totalRevenue)} total</span></div>
      </div>

      <aside className="panel attention-panel">
        <div className="panel-heading"><div><p className="eyebrow">ROUTE PLANNING</p><h2>Restock attention</h2></div><button className="icon-button" aria-label="Log restock" onClick={() => setModal('restock')}><Plus size={17}/></button></div>
        <div className="attention-list">{report.filter((row) => row.due).sort((a, b) => b.daysSince - a.daysSince).map((row) => <div className="attention-item" key={row.location.id}>
          <span className={`dot ${row.daysSince > row.location.restockCadenceDays ? 'overdue' : ''}`}></span>
          <div><strong>{row.location.name}</strong><span>{row.daysSince > row.location.restockCadenceDays ? `${row.daysSince - row.location.restockCadenceDays} days overdue` : 'Due today'} · last stop {row.latest ? dateLabel(row.latest) : '—'}</span></div>
          <button onClick={() => { setActiveLocationId(row.location.id); setModal('restock') }}>Log</button>
        </div>)}</div>
        <p className="attention-hint">Cadence is set per placement. Keep your kitchens fresh without extra route miles.</p>
      </aside>
    </section>

    <section className="panel locations-panel">
      <div className="panel-heading"><div><p className="eyebrow">PLACEMENTS</p><h2>Active locations</h2></div><button className="text-button" onClick={() => { setEditing(null); setModal('location') }}>+ Add location</button></div>
      <div className="location-table"><div className="table-head"><span>LOCATION</span><span>PRICING</span><span>OCT. REVENUE</span><span>LAST RESTOCK</span><span></span></div>
        {report.map((row) => <div className="table-row" key={row.location.id}><div className="place"><span className="place-icon"><Coffee size={16}/></span><div><strong>{row.location.name}</strong><span>{row.location.address}</span></div></div><div><span className="model-tag">{row.location.pricingModel === 'flat' ? 'Flat monthly' : `${money(row.location.price)}/cup`}</span></div><strong>{money(row.revenue)}</strong><span className={row.due ? 'restock-status due' : 'restock-status'}>{row.latest ? `${dateLabel(row.latest)}${row.due ? ' · due' : ''}` : 'No restock'}</span><button className="edit-button" onClick={() => { setEditing(row.location); setModal('location') }}>Edit</button></div>)}
      </div>
    </section>
    <footer>Groundwork is a simple operational dashboard for independent coffee routes. <span>Sample data · fictional businesses</span></footer>
    {modal === 'location' && <LocationModal initial={editing} onClose={() => { setModal(null); setEditing(null) }} onSave={saveLocation} />}
    {modal === 'cups' && <CupsModal locations={data.locations} selectedId={activeLocationId} onClose={() => setModal(null)} onSave={addCups} />}
    {modal === 'restock' && <RestockModal locations={data.locations} selectedId={activeLocationId} onClose={() => setModal(null)} onSave={addRestock} />}
  </main>
}

function Stat({ label, value, note, icon, warm = false }: { label: string; value: string; note: string; icon: React.ReactNode; warm?: boolean }) {
  return <div className={`stat ${warm ? 'warm' : ''}`}><div><p>{label}</p><strong>{value}</strong><span>{note}</span></div><span className="stat-icon">{icon}</span></div>
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={(event) => event.stopPropagation()}><div className="modal-head"><div><p className="eyebrow">ROUTE LOG</p><h2>{title}</h2></div><button onClick={onClose} aria-label="Close"><X size={20}/></button></div>{children}</div></div>
}

function LocationModal({ initial, onClose, onSave }: { initial: Location | null; onClose: () => void; onSave: (location: Location) => void }) {
  const [form, setForm] = useState<Location>(initial ?? { id: id(), name: '', address: '', installDate: '2026-10-21', pricingModel: 'per-cup', price: 1.5, restockCadenceDays: 14 })
  const update = <K extends keyof Location>(key: K, value: Location[K]) => setForm({ ...form, [key]: value })
  return <Modal title={initial ? 'Edit placement' : 'Add a placement'} onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSave(form) }}>
    <label>Business name<input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Morning Paper Co." /></label><label>Address<input required value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, city" /></label>
    <div className="form-grid"><label>Install date<input required type="date" value={form.installDate} onChange={(e) => update('installDate', e.target.value)} /></label><label>Restock cadence<input required type="number" min="1" value={form.restockCadenceDays} onChange={(e) => update('restockCadenceDays', Number(e.target.value))} /><small>days</small></label></div>
    <div className="form-grid"><label>Pricing model<select value={form.pricingModel} onChange={(e) => update('pricingModel', e.target.value as Location['pricingModel'])}><option value="per-cup">Per cup</option><option value="flat">Flat monthly</option></select></label><label>{form.pricingModel === 'per-cup' ? 'Price per cup' : 'Monthly price'}<div className="money-input"><span>$</span><input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', Number(e.target.value))} /></div></label></div>
    <div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit">Save placement</button></div>
  </form></Modal>
}

function CupsModal({ locations, selectedId, onClose, onSave }: { locations: Location[]; selectedId: string; onClose: () => void; onSave: (cup: CupLog) => void }) {
  const [locationId, setLocationId] = useState(selectedId); const [date, setDate] = useState('2026-10-21'); const [count, setCount] = useState(0)
  return <Modal title="Log cups sold" onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSave({ id: id(), locationId, date, count }) }}><label>Placement<select value={locationId} onChange={(e) => setLocationId(e.target.value)}>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><div className="form-grid"><label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><label>Cups sold<input type="number" min="1" required value={count || ''} onChange={(e) => setCount(Number(e.target.value))} /></label></div><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit">Save cups</button></div></form></Modal>
}

function RestockModal({ locations, selectedId, onClose, onSave }: { locations: Location[]; selectedId: string; onClose: () => void; onSave: (restock: Restock) => void }) {
  const [locationId, setLocationId] = useState(selectedId); const [date, setDate] = useState('2026-10-21'); const [items, setItems] = useState(''); const [cost, setCost] = useState(0)
  return <Modal title="Log a restock" onClose={onClose}><form onSubmit={(e) => { e.preventDefault(); onSave({ id: id(), locationId, date, items, cost }) }}><label>Placement<select value={locationId} onChange={(e) => setLocationId(e.target.value)}>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select></label><div className="form-grid"><label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><label>Total cost<div className="money-input"><span>$</span><input type="number" min="0" required step="0.01" value={cost || ''} onChange={(e) => setCost(Number(e.target.value))} /></div></label></div><label>Items<input required value={items} onChange={(e) => setItems(e.target.value)} placeholder="Beans, milk, cups…" /></label><div className="modal-actions"><button type="button" className="secondary" onClick={onClose}>Cancel</button><button type="submit">Save restock</button></div></form></Modal>
}

createRoot(document.getElementById('root')!).render(<App />)
