import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ExternalLink, Zap, DollarSign, Check, Star, Lock } from 'lucide-react'

/* ─── Letter → Emoji mapping ─────────────────────────────────────────── */
const LETTER_EMOJI = {
  A:'🅰️', B:'🅱️', C:'🅲', D:'🅳', E:'🅴', F:'🅵', G:'🅶', H:'🅷', I:'🅸',
  J:'🅹', K:'🅺', L:'🅻', M:'🅼', N:'🅽', O:'🅾️', P:'🅿️', Q:'🆀', R:'🆁',
  S:'🆂', T:'🆃', U:'🆄', V:'🆅', W:'🆆', X:'🆇', Y:'🆈', Z:'🆉',
}

/* ─── A-Z Master Data ──────────────────────────────────────────────────── */
const AZ_DATA = [
  { letter:'A', items:[
    { name:'Anthropic (Claude API)', url:'https://www.anthropic.com/', pricing:'$3–$15 / 1M tokens', best:'Chatbots, reasoning', badge:'LLM' },
    { name:'AssemblyAI', url:'https://www.assemblyai.com/', pricing:'Free tier + ~$0.15/hr audio', best:'Speech-to-text', badge:'Voice' },
  ]},
  { letter:'B', items:[
    { name:'BigML', url:'https://bigml.com/', pricing:'Free tier + from ~$30/month', best:'ML without coding', badge:'ML' },
  ]},
  { letter:'C', items:[
    { name:'Cohere', url:'https://cohere.ai/', pricing:'~$1–$15 / 1M tokens', best:'NLP APIs', badge:'LLM' },
    { name:'Clarifai', url:'https://www.clarifai.com/', pricing:'Free tier + usage-based', best:'Image recognition', badge:'Vision' },
    { name:'Codeium', url:'https://codeium.com/', pricing:'Fully free', best:'AI code editor', badge:'Coding' },
    { name:'Cursor', url:'https://cursor.sh/', pricing:'Free + paid plans', best:'AI-powered code editor', badge:'Coding' },
  ]},
  { letter:'D', items:[
    { name:'Deepgram', url:'https://deepgram.com/', pricing:'~$0.004/sec audio', best:'Voice AI', badge:'Voice' },
    { name:'DeepSeek', url:'https://platform.deepseek.com/', pricing:'$0.14 input / $0.28 output per 1M tokens', best:'Low-cost LLM', badge:'LLM' },
  ]},
  { letter:'E', items:[
    { name:'ElevenLabs', url:'https://elevenlabs.io/', pricing:'Free + $5/month+', best:'Text-to-speech', badge:'Voice' },
  ]},
  { letter:'F', items:[
    { name:'Fal AI', url:'https://fal.ai/', pricing:'Pay per usage', best:'Image & video generation', badge:'Image' },
    { name:'Figma AI', url:'https://figma.com/', pricing:'Included in paid plans ($12/month+)', best:'UI design AI', badge:'Design' },
    { name:'Falcon / LLaMA', url:'https://huggingface.co/', pricing:'Open weights — ₹0 cost', best:'Open-source LLMs (self-host)', badge:'Open Source' },
  ]},
  { letter:'G', items:[
    { name:'Google AI Studio (Gemini)', url:'https://ai.google.dev/', pricing:'Free tier (large limits)', best:'Best free LLM right now', badge:'LLM' },
    { name:'Google Vertex AI', url:'https://cloud.google.com/vertex-ai', pricing:'~$1.25–$10 / 1M tokens', best:'Full AI platform', badge:'Platform' },
    { name:'Google Speech-to-Text', url:'https://cloud.google.com/speech-to-text', pricing:'Free monthly usage', best:'Speech recognition', badge:'Voice' },
    { name:'Google Vision OCR', url:'https://cloud.google.com/vision', pricing:'Free monthly quota', best:'OCR & document AI', badge:'Vision' },
    { name:'GitHub Models', url:'https://github.com/', pricing:'Free tier', best:'AI model hosting', badge:'Platform' },
    { name:'Groq API', url:'https://console.groq.com/', pricing:'Free tier (rate limited)', best:'Ultra-fast inference', badge:'LLM' },
  ]},
  { letter:'H', items:[
    { name:'Hugging Face', url:'https://huggingface.co/', pricing:'Free + paid inference ($0.06/hr+)', best:'Open-source models', badge:'Platform' },
  ]},
  { letter:'I', items:[
    { name:'IBM Watson', url:'https://www.ibm.com/watson', pricing:'Free tier + enterprise pricing', best:'Enterprise AI', badge:'Enterprise' },
    { name:'Inworld AI', url:'https://inworld.ai/', pricing:'Free tier', best:'Game / NPC AI', badge:'Gaming' },
  ]},
  { letter:'J', items:[
    { name:'Jasper AI', url:'https://jasper.ai/', pricing:'~$39/month', best:'Content writing', badge:'Writing' },
  ]},
  { letter:'K', items:[
    { name:'Kore.ai', url:'https://kore.ai/', pricing:'Enterprise pricing', best:'Chatbots', badge:'Enterprise' },
  ]},
  { letter:'L', items:[
    { name:'Leonardo AI', url:'https://leonardo.ai/', pricing:'Free tier + paid plans', best:'Image generation', badge:'Image' },
    { name:'LM Studio', url:'https://lmstudio.ai/', pricing:'Free — run locally', best:'Local LLM runner', badge:'Open Source' },
    { name:'Luma AI', url:'https://lumalabs.ai/', pricing:'Free + paid plans', best:'3D generation', badge:'3D' },
  ]},
  { letter:'M', items:[
    { name:'Microsoft Azure OpenAI', url:'https://azure.microsoft.com/', pricing:'~$0.15–$0.60 / 1M tokens', best:'Enterprise GPT apps', badge:'Enterprise' },
    { name:'Mistral AI', url:'https://mistral.ai/', pricing:'Free + cheap API', best:'Open-weight LLMs', badge:'LLM' },
  ]},
  { letter:'N', items:[
    { name:'NVIDIA AI', url:'https://developer.nvidia.com/', pricing:'Pay for GPU usage', best:'Deep learning', badge:'GPU' },
  ]},
  { letter:'O', items:[
    { name:'OpenAI', url:'https://openai.com/api', pricing:'$2.5 input / $15 output (1M tokens)', best:'ChatGPT, APIs', badge:'LLM' },
    { name:'OpenRouter', url:'https://openrouter.ai/', pricing:'Some models $0/token', best:'Multi-model switching', badge:'Platform' },
    { name:'Ollama', url:'https://ollama.com/', pricing:'Free — run locally', best:'Local model runner', badge:'Open Source' },
  ]},
  { letter:'P', items:[
    { name:'Pinecone', url:'https://pinecone.io/', pricing:'Free + usage-based', best:'RAG apps / Vector DB', badge:'Vector' },
    { name:'Pika Labs', url:'https://pika.art/', pricing:'Free credits', best:'Video generation', badge:'Video' },
  ]},
  { letter:'Q', items:[
    { name:'Qdrant', url:'https://qdrant.tech/', pricing:'Free + cloud plans', best:'Embeddings storage', badge:'Vector' },
  ]},
  { letter:'R', items:[
    { name:'Replicate', url:'https://replicate.com/', pricing:'Pay per run (~$0.01+)', best:'Running models', badge:'Platform' },
    { name:'Runway ML', url:'https://runwayml.com/', pricing:'Free credits + $15/month', best:'Video generation', badge:'Video' },
  ]},
  { letter:'S', items:[
    { name:'Stability AI', url:'https://stability.ai/', pricing:'Pay-per-image', best:'Image generation', badge:'Image' },
  ]},
  { letter:'T', items:[
    { name:'Together AI', url:'https://together.ai/', pricing:'~$0.20 / 1M tokens', best:'Low-cost LLMs', badge:'LLM' },
  ]},
  { letter:'U', items:[
    { name:'UiPath AI', url:'https://www.uipath.com/', pricing:'Free + enterprise', best:'RPA + AI automation', badge:'RPA' },
  ]},
  { letter:'V', items:[
    { name:'Vercel AI SDK', url:'https://vercel.com/', pricing:'Free + usage', best:'Frontend AI apps', badge:'SDK' },
    { name:'Voyage AI', url:'https://www.voyageai.com/', pricing:'Free initially', best:'Embeddings', badge:'Vector' },
  ]},
  { letter:'W', items:[
    { name:'Weights & Biases', url:'https://wandb.ai/', pricing:'Free + paid', best:'ML tracking', badge:'MLOps' },
  ]},
  { letter:'X', items:[
    { name:'xAI (Grok API)', url:'https://x.ai/', pricing:'Included in X Premium+', best:'Grok AI', badge:'LLM' },
  ]},
  { letter:'Y', items:[
    { name:'You.com AI', url:'https://you.com/', pricing:'Free + Pro plans', best:'AI search', badge:'Search' },
  ]},
  { letter:'Z', items:[
    { name:'Zapier AI', url:'https://zapier.com/', pricing:'Free + $19/month+', best:'Automation with AI', badge:'Automation' },
  ]},
]

/* ─── Free AI APIs Data ─────────────────────────────────────────────────── */
const FREE_SECTIONS = [
  {
    icon:'🤖', title:'LLM / Chat AI',
    items:[
      { name:'Google AI Studio (Gemini)', url:'https://ai.google.dev/', note:'Free tier (large limits)', star:'Best free LLM right now' },
      { name:'OpenRouter', url:'https://openrouter.ai/', note:'Some models = $0/token', star:'Switch between GPT, Claude, Llama' },
      { name:'Groq API', url:'https://console.groq.com/', note:'Free access (rate limited)', star:'Ultra-fast responses' },
      { name:'DeepSeek', url:'https://platform.deepseek.com/', note:'5M free tokens', star:null },
      { name:'Hugging Face Inference API', url:'https://huggingface.co/', note:'Free (limited)', star:'100K+ models' },
    ]
  },
  {
    icon:'🖼️', title:'Image Generation',
    items:[
      { name:'Stability AI (Stable Diffusion)', url:'https://platform.stability.ai/', note:'Free credits', star:null },
      { name:'Leonardo AI', url:'https://leonardo.ai/', note:'Free tier', star:null },
      { name:'Replicate (free models)', url:'https://replicate.com/', note:'Some models run free', star:null },
    ]
  },
  {
    icon:'🎤', title:'Voice / Speech',
    items:[
      { name:'ElevenLabs (Free Plan)', url:'https://elevenlabs.io/', note:'Free voices', star:null },
      { name:'Google Speech-to-Text', url:'https://cloud.google.com/speech-to-text', note:'Free monthly usage', star:null },
      { name:'OpenAI TTS (trial credits)', url:'https://openai.com/', note:'Free trial credits', star:null },
    ]
  },
  {
    icon:'🎥', title:'Video AI',
    items:[
      { name:'Runway ML (free credits)', url:'https://runwayml.com/', note:'125 free credits', star:null },
      { name:'Pika Labs', url:'https://pika.art/', note:'Free credits', star:null },
    ]
  },
  {
    icon:'🧠', title:'Embeddings / Vector',
    items:[
      { name:'OpenAI Embeddings (free credits)', url:'https://platform.openai.com/', note:'Free credits on signup', star:null },
      { name:'Google Embeddings', url:'https://ai.google.dev/', note:'Free via AI Studio', star:null },
      { name:'Voyage AI', url:'https://www.voyageai.com/', note:'Free initially', star:null },
    ]
  },
  {
    icon:'📄', title:'OCR / Document AI',
    items:[
      { name:'Google Vision OCR', url:'https://cloud.google.com/vision', note:'Free monthly quota', star:null },
      { name:'Mistral OCR', url:'https://mistral.ai/', note:'Free usage', star:null },
    ]
  },
  {
    icon:'💻', title:'Coding AI',
    items:[
      { name:'Codeium', url:'https://codeium.com/', note:'Fully free', star:'Completely free editor AI' },
      { name:'GitHub Models (free tier)', url:'https://github.com/', note:'Free tier', star:null },
      { name:'Cursor (free plan)', url:'https://cursor.sh/', note:'Free plan available', star:null },
    ]
  },
  {
    icon:'🎮', title:'Game / NPC AI',
    items:[
      { name:'Inworld AI', url:'https://inworld.ai/', note:'Free tier', star:null },
    ]
  },
  {
    icon:'🧪', title:'100% Open Source (Self-host)',
    items:[
      { name:'Ollama (local models)', url:'https://ollama.com/', note:'Run locally — ₹0 cost', star:'Completely free, private' },
      { name:'LM Studio', url:'https://lmstudio.ai/', note:'Run locally — ₹0 cost', star:null },
      { name:'Falcon / LLaMA models', url:'https://huggingface.co/', note:'Open weights — ₹0 cost', star:null },
    ]
  },
]

/* ─── Paid AI APIs Data ─────────────────────────────────────────────────── */
const PAID_AZ = [
  { letter:'A', items:[{ name:'Anthropic (Claude)', url:'https://www.anthropic.com/', pricing:'$3–$15 / 1M tokens' }]},
  { letter:'B', items:[{ name:'BigML', url:'https://bigml.com/', pricing:'$30/month+' }]},
  { letter:'C', items:[
    { name:'Cohere', url:'https://cohere.ai/', pricing:'$1–$15 / 1M tokens' },
    { name:'Clarifai', url:'https://clarifai.com/', pricing:'Usage-based' },
  ]},
  { letter:'D', items:[{ name:'DeepSeek', url:'https://platform.deepseek.com/', pricing:'$0.14 input / $0.28 output per 1M tokens' }]},
  { letter:'E', items:[{ name:'ElevenLabs', url:'https://elevenlabs.io/', pricing:'$5/month+' }]},
  { letter:'F', items:[{ name:'Fal AI', url:'https://fal.ai/', pricing:'Pay per usage' }]},
  { letter:'G', items:[{ name:'Google Vertex AI (Gemini)', url:'https://cloud.google.com/vertex-ai', pricing:'~$1–$10 / 1M tokens' }]},
  { letter:'H', items:[{ name:'Hugging Face Pro', url:'https://huggingface.co/', pricing:'$9/month+' }]},
  { letter:'I', items:[{ name:'IBM Watson', url:'https://ibm.com/watson', pricing:'Enterprise pricing' }]},
  { letter:'J', items:[{ name:'Jasper AI', url:'https://jasper.ai/', pricing:'$39/month' }]},
  { letter:'K', items:[{ name:'Kore.ai', url:'https://kore.ai/', pricing:'Enterprise' }]},
  { letter:'L', items:[{ name:'Luma AI', url:'https://lumalabs.ai/', pricing:'Free + paid' }]},
  { letter:'M', items:[
    { name:'Mistral AI', url:'https://mistral.ai/', pricing:'Very low-cost API' },
    { name:'Microsoft Azure OpenAI', url:'https://azure.microsoft.com/', pricing:'~$0.15–$0.60 / 1M tokens' },
  ]},
  { letter:'N', items:[{ name:'NVIDIA AI', url:'https://developer.nvidia.com/', pricing:'GPU-based pricing' }]},
  { letter:'O', items:[{ name:'OpenAI', url:'https://openai.com/api', pricing:'~$2.5 input / $15 output (1M tokens)' }]},
  { letter:'P', items:[{ name:'Pinecone', url:'https://pinecone.io/', pricing:'Usage-based' }]},
  { letter:'Q', items:[{ name:'Qdrant', url:'https://qdrant.tech/', pricing:'Free + cloud pricing' }]},
  { letter:'R', items:[{ name:'Replicate', url:'https://replicate.com/', pricing:'~$0.01/run' }]},
  { letter:'S', items:[{ name:'Stability AI', url:'https://stability.ai/', pricing:'Pay per image' }]},
  { letter:'T', items:[{ name:'Together AI', url:'https://together.ai/', pricing:'~$0.20 / 1M tokens' }]},
  { letter:'U', items:[{ name:'UiPath AI', url:'https://uipath.com/', pricing:'Enterprise' }]},
  { letter:'V', items:[{ name:'Vercel AI SDK', url:'https://vercel.com/', pricing:'Usage-based' }]},
  { letter:'W', items:[{ name:'Weights & Biases', url:'https://wandb.ai/', pricing:'Free + paid' }]},
  { letter:'X', items:[{ name:'xAI (Grok API)', url:'https://x.ai/', pricing:'Included in premium' }]},
  { letter:'Y', items:[{ name:'You.com AI', url:'https://you.com/', pricing:'Free + Pro' }]},
  { letter:'Z', items:[{ name:'Zapier AI', url:'https://zapier.com/', pricing:'$19/month+' }]},
]

/* ─── Summary Data ──────────────────────────────────────────────────────── */
const BEST_SUMMARY = {
  free:  ['Google AI Studio (Gemini)', 'Groq', 'OpenRouter', 'Hugging Face', 'DeepSeek'],
  cheap: ['DeepSeek', 'Together AI', 'Mistral'],
  best:  ['OpenAI', 'Google Vertex AI', 'Anthropic'],
}

const BADGE_COLORS = {
  LLM:'#7c3aed', Voice:'#10b981', ML:'#0ea5e9', Vision:'#ec4899', Platform:'#6366f1',
  Enterprise:'#f59e0b', Vector:'#14b8a6', Image:'#f97316', Video:'#ef4444',
  Design:'#8b5cf6', GPU:'#22d3ee', SDK:'#84cc16', Search:'#fb923c',
  Writing:'#a78bfa', RPA:'#34d399', MLOps:'#60a5fa', '3D':'#f472b6',
  Automation:'#fb7185', Gaming:'#4ade80', Coding:'#38bdf8', 'Open Source':'#a3e635',
}

/* ─── Alphabet sidebar ─────────────────────────────────────────────────── */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/* ─── Sub-components ──────────────────────────────────────────────────── */
function AlphabetNav({ activeTab }) {
  if (activeTab !== 'az' && activeTab !== 'paid') return null
  const data = activeTab === 'az' ? AZ_DATA : PAID_AZ
  const letters = data.map(d => d.letter)
  return (
    <div style={{
      display:'flex', flexWrap:'wrap', gap:4, marginBottom:28, padding:'12px 16px',
      borderRadius:14, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)',
    }}>
      {ALPHABET.map((l) => {
        const exists = letters.includes(l)
        return (
          <a
            key={l}
            href={exists ? `#${activeTab}-${l}` : undefined}
            onClick={(e) => {
              if (!exists) { e.preventDefault(); return }
              e.preventDefault()
              const el = document.getElementById(`${activeTab}-${l}`)
              if (el) el.scrollIntoView({ behavior:'smooth', block:'start' })
            }}
            style={{
              width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:13, fontWeight:600, textDecoration:'none', transition:'all 0.2s',
              cursor: exists ? 'pointer' : 'default',
              background: exists ? 'rgba(124,58,237,0.12)' : 'transparent',
              border: exists ? '1px solid rgba(124,58,237,0.25)' : '1px solid transparent',
              color: exists ? '#c4b5fd' : 'rgba(245,240,230,0.15)',
            }}
          >
            {l}
          </a>
        )
      })}
    </div>
  )
}

function AZCard({ name, url, pricing, best, badge }) {
  return (
    <div
      style={{
        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:14, padding:'16px 18px', display:'flex', flexDirection:'column', gap:8,
        transition:'all 0.2s', cursor:'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background='rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.3)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <span style={{ fontWeight:600, fontSize:14, color:'hsl(40,6%,95%)', flex:1 }}>{name}</span>
        <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
          {badge && (
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:99, background:`${BADGE_COLORS[badge] || '#7c3aed'}22`, border:`1px solid ${BADGE_COLORS[badge] || '#7c3aed'}44`, color: BADGE_COLORS[badge] || '#c4b5fd' }}>
              {badge}
            </span>
          )}
          <a href={url} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} style={{ color:'rgba(245,240,230,0.3)', display:'flex' }}>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <DollarSign size={12} color="#34d399" style={{ flexShrink:0 }} />
        <span style={{ fontSize:12, color:'rgba(245,240,230,0.55)' }}>{pricing}</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <Check size={12} color="#a78bfa" style={{ flexShrink:0 }} />
        <span style={{ fontSize:12, color:'rgba(245,240,230,0.45)' }}>{best}</span>
      </div>
    </div>
  )
}

function FreeCard({ name, url, note, star }) {
  return (
    <div
      style={{
        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:12, padding:'14px 16px', display:'flex', flexDirection:'column', gap:6,
        transition:'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background='rgba(16,185,129,0.06)'; e.currentTarget.style.borderColor='rgba(16,185,129,0.25)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}
    >
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <span style={{ fontWeight:600, fontSize:13, color:'hsl(40,6%,95%)', flex:1 }}>{name}</span>
        <a href={url} target="_blank" rel="noreferrer" style={{ color:'rgba(245,240,230,0.3)', display:'flex' }}>
          <ExternalLink size={12} />
        </a>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <Zap size={11} color="#34d399" style={{ flexShrink:0 }} />
        <span style={{ fontSize:12, color:'#34d399' }}>{note}</span>
      </div>
      {star && (
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Star size={11} color="#fbbf24" style={{ flexShrink:0 }} />
          <span style={{ fontSize:11, color:'#fbbf24' }}>{star}</span>
        </div>
      )}
    </div>
  )
}

function PaidCard({ name, url, pricing }) {
  return (
    <div
      style={{
        background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8,
        transition:'all 0.2s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background='rgba(251,113,133,0.06)'; e.currentTarget.style.borderColor='rgba(251,113,133,0.25)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)' }}
    >
      <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
        <span style={{ fontWeight:600, fontSize:13, color:'hsl(40,6%,95%)' }}>{name}</span>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Lock size={11} color="#fb7185" style={{ flexShrink:0 }} />
          <span style={{ fontSize:12, color:'rgba(245,240,230,0.55)' }}>{pricing}</span>
        </div>
      </div>
      <a href={url} target="_blank" rel="noreferrer" style={{ color:'rgba(245,240,230,0.3)', display:'flex', flexShrink:0 }}>
        <ExternalLink size={12} />
      </a>
    </div>
  )
}

/* ─── Stats bar ────────────────────────────────────────────────────────── */
function StatsBar() {
  const totalAZ = AZ_DATA.reduce((acc, g) => acc + g.items.length, 0)
  const totalFree = FREE_SECTIONS.reduce((acc, s) => acc + s.items.length, 0)
  const totalPaid = PAID_AZ.reduce((acc, g) => acc + g.items.length, 0)
  return (
    <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:28 }}>
      {[
        { label:'Total A–Z Apps', value:totalAZ, color:'#7c3aed', bg:'rgba(124,58,237,0.12)' },
        { label:'Free APIs', value:totalFree, color:'#34d399', bg:'rgba(16,185,129,0.12)' },
        { label:'Paid APIs', value:totalPaid, color:'#fb7185', bg:'rgba(251,113,133,0.12)' },
        { label:'Categories', value:FREE_SECTIONS.length, color:'#fbbf24', bg:'rgba(251,191,36,0.12)' },
      ].map(s => (
        <div key={s.label} style={{
          padding:'12px 20px', borderRadius:12, background:s.bg, border:`1px solid ${s.color}33`,
          display:'flex', alignItems:'center', gap:10, flex:'1 1 140px', minWidth:140,
        }}>
          <span style={{ fontSize:24, fontWeight:800, color:s.color, fontFamily:'General Sans, sans-serif' }}>{s.value}</span>
          <span style={{ fontSize:12, color:'rgba(245,240,230,0.6)', fontWeight:500 }}>{s.label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Page ──────────────────────────────────────────────────────────────── */
export default function AtoZ() {
  const [tab, setTab] = useState('az')

  const TABS = [
    { id:'az', label:'🗂️ A–Z Apps & APIs' },
    { id:'free', label:'🟢 Free AI APIs' },
    { id:'paid', label:'💰 Paid AI APIs' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'hsl(260,87%,3%)' }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'100px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'General Sans,sans-serif', fontWeight:700, fontSize:36, color:'hsl(40,6%,95%)', letterSpacing:'-0.03em', marginBottom:8 }}>
            A–Z AI Apps & APIs
          </h1>
          <p style={{ color:'rgba(245,240,230,0.5)', fontSize:15 }}>
            Comprehensive directory of AI tools with pricing, links & categories — includes free & paid sections
          </p>
        </div>

        {/* Stats Bar */}
        <StatsBar />

        {/* Quick Summary Chips */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:24, marginBottom:36, padding:'20px 24px', borderRadius:16, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
          {[['🟢 Best Free', BEST_SUMMARY.free, '#34d399'], ['💸 Cheapest', BEST_SUMMARY.cheap, '#fbbf24'], ['🚀 Best Overall', BEST_SUMMARY.best, '#a78bfa']].map(([label, items, color]) => (
            <div key={label} style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <span style={{ fontSize:12, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {items.map((i) => (
                  <span key={i} style={{ fontSize:12, padding:'3px 10px', borderRadius:99, background:`${color}18`, border:`1px solid ${color}33`, color }}>{i}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, padding:4, background:'rgba(255,255,255,0.03)', borderRadius:14, border:'1px solid rgba(255,255,255,0.06)', width:'fit-content' }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'10px 20px', borderRadius:10, border:'none', cursor:'pointer', fontSize:14, fontWeight:500,
              background: tab === t.id ? 'rgba(124,58,237,0.3)' : 'transparent',
              color: tab === t.id ? '#c4b5fd' : 'rgba(245,240,230,0.5)',
              transition:'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Alphabet quick nav */}
        <AlphabetNav activeTab={tab} />

        {/* ── Tab: A-Z ── */}
        {tab === 'az' && (
          <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
            {AZ_DATA.map(({ letter, items }) => (
              <div key={letter} id={`az-${letter}`}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, gap:4 }}>
                    <span style={{ fontSize:20, lineHeight:1 }}>{LETTER_EMOJI[letter] || letter}</span>
                  </div>
                  <span style={{ fontFamily:'General Sans,sans-serif', fontWeight:700, fontSize:20, color:'#c4b5fd' }}>{letter}</span>
                  <div style={{ flex:1, height:1, background:'linear-gradient(to right, rgba(124,58,237,0.3), transparent)' }} />
                  <span style={{ fontSize:12, color:'rgba(245,240,230,0.3)' }}>{items.length} app{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:12 }}>
                  {items.map((item) => <AZCard key={item.name} {...item} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Free APIs ── */}
        {tab === 'free' && (
          <div style={{ display:'flex', flexDirection:'column', gap:40 }}>
            <div style={{ padding:'16px 20px', borderRadius:14, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', display:'flex', alignItems:'flex-start', gap:12 }}>
              <Zap size={18} color="#34d399" style={{ flexShrink:0, marginTop:2 }} />
              <div>
                <div style={{ fontWeight:600, color:'#34d399', fontSize:14, marginBottom:4 }}>💡 Important note about free tiers</div>
                <div style={{ fontSize:13, color:'rgba(245,240,230,0.6)', lineHeight:1.6 }}>
                  Most "free" AI = free tier with limited usage. Perfect for <strong style={{ color:'rgba(245,240,230,0.85)' }}>students, projects & testing</strong>.<br/>
                  Some are 100% free (self-hosted). Scale to paid when ready.
                </div>
              </div>
            </div>
            {FREE_SECTIONS.map((sec) => (
              <div key={sec.title}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                  <span style={{ fontSize:22 }}>{sec.icon}</span>
                  <h2 style={{ fontFamily:'General Sans,sans-serif', fontWeight:700, fontSize:20, color:'hsl(40,6%,95%)', margin:0 }}>{sec.title}</h2>
                  <div style={{ flex:1, height:1, background:'linear-gradient(to right, rgba(16,185,129,0.3), transparent)' }} />
                  <span style={{ fontSize:12, color:'rgba(245,240,230,0.3)' }}>{sec.items.length} tool{sec.items.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px,1fr))', gap:10 }}>
                  {sec.items.map((item) => <FreeCard key={item.name} {...item} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Paid APIs ── */}
        {tab === 'paid' && (
          <div style={{ display:'flex', flexDirection:'column', gap:36 }}>
            <div style={{ padding:'16px 20px', borderRadius:14, background:'rgba(251,113,133,0.08)', border:'1px solid rgba(251,113,133,0.2)', display:'flex', alignItems:'flex-start', gap:12 }}>
              <Lock size={18} color="#fb7185" style={{ flexShrink:0, marginTop:2 }} />
              <div>
                <div style={{ fontWeight:600, color:'#fb7185', fontSize:14, marginBottom:4 }}>💰 Paid AI APIs — A to Z</div>
                <div style={{ fontSize:13, color:'rgba(245,240,230,0.6)', lineHeight:1.6 }}>
                  All pricing is approximate and may change. Always check official pricing pages before production usage.
                </div>
              </div>
            </div>
            {PAID_AZ.map(({ letter, items }) => (
              <div key={letter} id={`paid-${letter}`}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'rgba(251,113,133,0.15)', border:'1px solid rgba(251,113,133,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, gap:4 }}>
                    <span style={{ fontSize:18, lineHeight:1 }}>{LETTER_EMOJI[letter] || letter}</span>
                  </div>
                  <span style={{ fontFamily:'General Sans,sans-serif', fontWeight:700, fontSize:18, color:'#fb7185' }}>{letter}</span>
                  <div style={{ flex:1, height:1, background:'linear-gradient(to right, rgba(251,113,133,0.3), transparent)' }} />
                  <span style={{ fontSize:12, color:'rgba(245,240,230,0.3)' }}>{items.length} API{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:10 }}>
                  {items.map((item) => <PaidCard key={item.name} {...item} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
