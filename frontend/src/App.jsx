import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { BarChart3, Search, LayoutDashboard, Tags, Store, FileSearch, Settings, Bell, ChevronDown, ArrowUpRight, Sparkles, Menu, X, Loader2 } from 'lucide-react'

const API = 'http://localhost:8000'
const money = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function StatCard({ label, value, change, icon: Icon }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><span className="rounded-xl bg-orange-50 p-2 text-orange-600"><Icon size={18}/></span></div>
    <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
    <div className="mt-2 text-xs font-medium text-emerald-600">↗ {change} this month <span className="font-normal text-slate-400">· demo metric</span></div>
  </div>
}

function App() {
  const [page, setPage] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [keywords, setKeywords] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [title, setTitle] = useState('Minimalist Daily Digital Planner for Goodnotes')
  const [tags, setTags] = useState('digital planner, goodnotes planner, daily planner, ipad planner, minimalist planner')
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    Promise.all([fetch(`${API}/api/dashboard`).then(r => { if (!r.ok) throw new Error('API unavailable'); return r.json() }),
      fetch(`${API}/api/keywords`).then(r => r.json())])
      .then(([d, k]) => { setDashboard(d); setKeywords(k.results || []); setApiError('') })
      .catch(() => setApiError('Could not reach the API. Start the FastAPI backend at localhost:8000.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => keywords.filter(k => k.keyword.toLowerCase().includes(query.toLowerCase())), [keywords, query])
  const nav = [
    { name: 'Overview', icon: LayoutDashboard }, { name: 'Keyword Explorer', icon: Search },
    { name: 'Listing Analyzer', icon: FileSearch }, { name: 'Competitor Research', icon: Store },
    { name: 'Tag Explorer', icon: Tags },
  ]

  async function runAnalysis(e) {
    e.preventDefault(); setAnalyzing(true); setAnalysis(null)
    try {
      const response = await fetch(`${API}/api/listings/analyze`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ title, tags: tags.split(',').map(t => t.trim()).filter(Boolean) }) })
      if (!response.ok) throw new Error('Analysis failed')
      setAnalysis(await response.json())
    } catch { setAnalysis({ error: 'Could not reach the backend. Make sure FastAPI is running.' }) }
    finally { setAnalyzing(false) }
  }

  function Sidebar() {
    return <aside className={`${mobileOpen ? 'fixed inset-0 z-40 flex' : 'hidden'} lg:flex lg:static lg:w-64 lg:shrink-0 lg:flex-col bg-[#172033] text-white`}>
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
        <div className="flex items-center gap-2.5"><div className="rounded-lg bg-orange-400 p-2 text-slate-900"><BarChart3 size={19}/></div><span className="text-lg font-semibold tracking-tight">MarketScope</span></div>
        <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X/></button>
      </div>
      <div className="px-4 pt-7 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-500">Workspace</div>
      <nav className="mt-3 space-y-1 px-3">{nav.map(item => <button key={item.name} onClick={() => {setPage(item.name); setMobileOpen(false)}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${page === item.name ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><item.icon size={18}/>{item.name}</button>)}</nav>
      <div className="mt-auto border-t border-white/10 p-4"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/5"><Settings size={18}/> Settings</button><div className="mt-3 rounded-xl bg-white/5 p-3"><div className="text-xs font-medium text-white">Demo workspace</div><div className="mt-1 text-[11px] text-slate-400">Live Etsy connection not configured</div></div></div>
    </aside>
  }

  return <div className="min-h-screen lg:flex">
    <Sidebar/>
    <main className="min-w-0 flex-1">
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
        <div className="flex items-center gap-3"><button className="text-slate-500 lg:hidden" onClick={() => setMobileOpen(true)}><Menu/></button><div className="text-sm text-slate-400">Workspace <span className="mx-2">/</span><span className="font-medium text-slate-700">{page}</span></div></div>
        <div className="flex items-center gap-3"><span className="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 sm:inline-flex">Demo data</span><button className="rounded-full p-2 text-slate-500 hover:bg-slate-100"><Bell size={18}/></button><div className="flex items-center gap-2 border-l border-slate-200 pl-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">MS</div><ChevronDown size={15} className="text-slate-400"/></div></div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {apiError && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{apiError}</div>}
        {loading ? <div className="flex items-center gap-2 py-20 text-slate-500"><Loader2 className="animate-spin"/> Loading analytics…</div> : <>
          {page === 'Overview' && <Overview dashboard={dashboard} keywords={keywords}/>}
          {page === 'Keyword Explorer' && <KeywordExplorer query={query} setQuery={setQuery} filtered={filtered}/>}
          {page === 'Listing Analyzer' && <ListingAnalyzer title={title} setTitle={setTitle} tags={tags} setTags={setTags} analysis={analysis} analyzing={analyzing} runAnalysis={runAnalysis}/>}
          {page === 'Competitor Research' && <ComingSoon title="Competitor Research" desc="Compare shop-level listing mix, pricing, tags, and observable engagement once authorized marketplace data is connected."/>}
          {page === 'Tag Explorer' && <KeywordExplorer query={query} setQuery={setQuery} filtered={filtered} tagMode/>}
        </>}
        <footer className="mt-12 border-t border-slate-200 pt-5 text-xs text-slate-400">MarketScope MVP · Illustrative demo data · Not affiliated with Etsy</footer>
      </div>
    </main>
  </div>
}

function PageHeading({ eyebrow, title, desc }) {
  return <div className="mb-7"><div className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-orange-600">{eyebrow}</div><h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{desc}</p></div>
}

function Overview({ dashboard, keywords }) {
  if (!dashboard) return null
  return <>
    <PageHeading eyebrow="Your workspace" title="Analytics overview" desc="A snapshot of marketplace research, keyword opportunities, and listing activity."/>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3"><div className="flex items-center gap-2 text-sm text-orange-900"><Sparkles size={17}/><span className="font-medium">Explore your next keyword opportunity</span></div><span className="text-xs text-orange-700">Sample analytics · Connect Etsy later</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Tracked listings" value={dashboard.tracked_listings.toLocaleString()} change={`${dashboard.tracked_listings_change}%`} icon={Store}/>
      <StatCard label="Average listing price" value={money(dashboard.average_price)} change={`${dashboard.average_price_change}%`} icon={ArrowUpRight}/>
      <StatCard label="Keywords tracked" value={dashboard.keywords_tracked} change="New workspace" icon={Search}/>
      <StatCard label="Average favourites" value={dashboard.average_favourites.toLocaleString()} change={`${dashboard.favourites_change}%`} icon={Tags}/>
    </div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><h2 className="font-semibold text-slate-900">Keyword interest index</h2><p className="mt-1 text-xs text-slate-400">Illustrative index · not Etsy search volume</p></div><span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500">6 months</span></div><div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dashboard.trend}><defs><linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={.24}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#eef0f4" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#94a3b8',fontSize:12}}/><Tooltip contentStyle={{borderRadius:12,border:'1px solid #e2e8f0',fontSize:12}}/><Area type="monotone" dataKey="index" stroke="#ea9b2d" strokeWidth={2.5} fill="url(#fillTrend)"/></AreaChart></ResponsiveContainer></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Top keywords</h2><p className="mt-1 text-xs text-slate-400">Example research set</p><div className="mt-4 space-y-4">{keywords.slice(0,5).map(k=><div key={k.keyword}><div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">{k.keyword}</span><span className="text-slate-400">{k.interest_index}/100</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-400" style={{width:`${k.interest_index}%`}}/></div></div>)}</div></section>
    </div>
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-slate-900">Keyword snapshot</h2><p className="mt-1 text-xs text-slate-400">Illustrative marketplace metrics</p></div></div><KeywordTable rows={keywords.slice(0,5)}/></section>
  </>
}

function KeywordExplorer({ query, setQuery, filtered, tagMode }) {
  return <><PageHeading eyebrow="Research tools" title={tagMode ? 'Tag explorer' : 'Keyword explorer'} desc="Search the sample keyword dataset, compare listing counts, and inspect estimated competition categories."/>
    <div className="mb-5 flex max-w-xl items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><Search size={18} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try “planner”, “wedding”, or “cake”..." className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"/></div>
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-slate-900">Research results</h2><span className="text-xs text-slate-400">{filtered.length} keywords</span></div><KeywordTable rows={filtered}/></div>
    <p className="mt-3 text-xs text-slate-400">Competition is a demo classification based on sample listing counts. It is not an Etsy-provided keyword difficulty metric.</p>
  </>
}

function KeywordTable({ rows }) {
  if (!rows.length) return <p className="py-10 text-center text-sm text-slate-400">No matching keywords. Try another search.</p>
  return <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="pb-3 font-medium">Keyword</th><th className="pb-3 font-medium">Matching listings</th><th className="pb-3 font-medium">Avg. price</th><th className="pb-3 font-medium">Avg. favourites</th><th className="pb-3 font-medium">Competition</th></tr></thead><tbody>{rows.map(r=><tr key={r.keyword} className="border-b border-slate-50 last:border-0"><td className="py-4 font-medium text-slate-800">{r.keyword}</td><td className="py-4 text-slate-600">{r.listings.toLocaleString()}</td><td className="py-4 text-slate-600">{money(r.avg_price)}</td><td className="py-4 text-slate-600">{r.avg_favourites}</td><td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.competition==='Low'?'bg-emerald-50 text-emerald-700':r.competition==='Medium'?'bg-amber-50 text-amber-700':'bg-rose-50 text-rose-700'}`}>{r.competition}</span></td></tr>)}</tbody></table></div>
}

function ListingAnalyzer({ title, setTitle, tags, setTags, analysis, analyzing, runAnalysis }) {
  return <><PageHeading eyebrow="Optimization tools" title="Listing SEO analyzer" desc="Review your title and tags with a transparent checklist. This heuristic does not predict Etsy search ranking."/>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={runAnalysis} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><label className="mb-2 block text-sm font-medium text-slate-700">Listing title</label><input maxLength={140} value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"/><div className="mb-5 mt-1 text-right text-xs text-slate-400">{title.length}/140 characters</div><label className="mb-2 block text-sm font-medium text-slate-700">Tags <span className="font-normal text-slate-400">(comma-separated)</span></label><textarea rows={5} value={tags} onChange={e=>setTags(e.target.value)} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"/><div className="mt-1 text-xs text-slate-400">{tags.split(',').filter(t=>t.trim()).length} tags entered</div><button disabled={analyzing || !title.trim()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50">{analyzing ? <Loader2 className="animate-spin" size={17}/> : <Sparkles size={17}/>} Analyze listing</button></form>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Analysis results</h2>{!analysis ? <div className="grid min-h-64 place-items-center text-center"><div><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600"><FileSearch/></div><p className="text-sm text-slate-500">Your listing checklist will appear here.</p></div></div> : analysis.error ? <p className="mt-5 text-sm text-rose-600">{analysis.error}</p> : <div className="mt-5 space-y-5"><div className="flex items-center gap-4"><div className="grid h-20 w-20 place-items-center rounded-full border-[6px] border-orange-100 text-2xl font-semibold text-slate-900">{analysis.score}</div><div><div className="font-medium text-slate-800">Checklist score</div><div className="mt-1 text-xs text-slate-400">Heuristic score, not Etsy ranking</div></div></div><div className="grid grid-cols-2 gap-3"><MiniStat label="Title length" value={`${analysis.title_length}/140`}/><MiniStat label="Tags entered" value={analysis.tag_count}/></div><div><div className="mb-2 text-sm font-medium text-slate-700">Suggestions</div><ul className="space-y-2">{analysis.suggestions.map((s,i)=><li key={i} className="flex gap-2 text-sm leading-5 text-slate-600"><span className="mt-0.5 text-orange-500">•</span>{s}</li>)}</ul></div>{analysis.duplicate_tags.length>0 && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">Duplicate tags: {analysis.duplicate_tags.join(', ')}</p>}<p className="text-xs text-slate-400">{analysis.notice}</p></div>}</div>
    </div>
  </>
}
function MiniStat({label,value}) { return <div className="rounded-xl bg-slate-50 p-3"><div className="text-xs text-slate-400">{label}</div><div className="mt-1 font-semibold text-slate-800">{value}</div></div> }
function ComingSoon({title,desc}) { return <><PageHeading eyebrow="Research tools" title={title} desc={desc}/><div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-orange-50 text-orange-600"><Store/></div><h2 className="font-semibold text-slate-800">Ready for the next build phase</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">This module is scaffolded in the navigation. It will become useful once we connect authorized Etsy shop and listing data.</p></div></>}

export default App
