import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Link } from 'react-router-dom'
import { Check, ChevronDown, ChevronUp, ExternalLink, Copy, CheckCheck } from 'lucide-react'

const API_GUIDES = [
  {
    id: 'openai',
    name: 'OpenAI API',
    emoji: '🤖',
    color: '#10a37f',
    badge: 'Most Popular',
    description: 'Access GPT-4o, DALL·E, Whisper, and TTS models via API.',
    freeCredits: '$5 free credits for new users',
    pricingUrl: 'https://openai.com/pricing',
    docsUrl: 'https://platform.openai.com/docs',
    steps: [
      { title: 'Create Account', desc: 'Go to platform.openai.com and sign up with your email address.' },
      { title: 'Verify Email', desc: 'Check your inbox and click the verification link sent by OpenAI.' },
      { title: 'Navigate to API Keys', desc: 'Click your profile → Settings → API keys in the left sidebar.' },
      { title: 'Create Secret Key', desc: 'Click "Create new secret key", give it a name, then click Create.' },
      { title: 'Copy Your Key', desc: 'Copy the key immediately — it will not be shown again after closing the dialog!' },
      { title: 'Set Up Billing', desc: 'Go to Settings → Billing → Add payment method to enable API usage.' },
    ],
    sampleCode: `import openai\n\nclient = openai.OpenAI(api_key="YOUR_API_KEY")\n\nresponse = client.chat.completions.create(\n    model="gpt-4o",\n    messages=[{"role": "user", "content": "Hello!"}]\n)\nprint(response.choices[0].message.content)`,
  },
  {
    id: 'google-cloud',
    name: 'Google Cloud AI',
    emoji: '✨',
    color: '#4285f4',
    badge: 'Best Free Tier',
    description: 'Gemini, Text-to-Speech, Speech-to-Text, Vision APIs and more.',
    freeCredits: '$300 free credits for 90 days',
    pricingUrl: 'https://cloud.google.com/pricing',
    docsUrl: 'https://cloud.google.com/apis/docs',
    steps: [
      { title: 'Create Google Account', desc: 'Go to console.cloud.google.com with your Google account.' },
      { title: 'Create a New Project', desc: 'Click the project dropdown → New Project. Give it a meaningful name.' },
      { title: 'Enable Billing', desc: 'Go to Billing → Link a billing account (free $300 credits available).' },
      { title: 'Enable Required API', desc: 'APIs & Services → Library → Search for your API (e.g., "Text-to-Speech") → Enable.' },
      { title: 'Create API Key', desc: 'APIs & Services → Credentials → Create Credentials → API Key.' },
      { title: 'Restrict the Key', desc: 'Click your new key → Under "API restrictions", select the specific API for security.' },
    ],
    sampleCode: `from google.cloud import texttospeech\n\nclient = texttospeech.TextToSpeechClient()\nsynthesis_input = texttospeech.SynthesisInput(text="Hello!")\nvoice = texttospeech.VoiceSelectionParams(\n    language_code="en-US", name="en-US-Studio-M"\n)\naudio_config = texttospeech.AudioConfig(\n    audio_encoding=texttospeech.AudioEncoding.MP3\n)\nresponse = client.synthesize_speech(\n    input=synthesis_input, voice=voice, audio_config=audio_config\n)`,
  },
  {
    id: 'anthropic',
    name: 'Anthropic API (Claude)',
    emoji: '🧠',
    color: '#cc785c',
    badge: 'Best Quality',
    description: 'Access Claude 3.5 Sonnet, Haiku for text analysis and coding.',
    freeCredits: '$5 free credits for new users',
    pricingUrl: 'https://www.anthropic.com/pricing',
    docsUrl: 'https://docs.anthropic.com',
    steps: [
      { title: 'Sign Up', desc: 'Visit console.anthropic.com and create an account.' },
      { title: 'Verify Phone', desc: 'Enter your phone number for verification.' },
      { title: 'Go to API Keys', desc: 'Navigate to "API Keys" in the left sidebar.' },
      { title: 'Create Key', desc: 'Click "Create Key", name it, and copy it immediately.' },
      { title: 'Add Credits', desc: 'Go to Billing → Add credits to begin making API calls.' },
    ],
    sampleCode: `import anthropic\n\nclient = anthropic.Anthropic(api_key="YOUR_KEY")\n\nmessage = client.messages.create(\n    model="claude-3-5-sonnet-20241022",\n    max_tokens=1024,\n    messages=[\n        {"role": "user", "content": "Hello, Claude!"}\n    ]\n)\nprint(message.content)`,
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs API',
    emoji: '🎙️',
    color: '#f59e0b',
    badge: 'Best TTS',
    description: 'Realistic voice synthesis, voice cloning, and multilingual TTS.',
    freeCredits: '10,000 characters/month free',
    pricingUrl: 'https://elevenlabs.io/pricing',
    docsUrl: 'https://docs.elevenlabs.io',
    steps: [
      { title: 'Create Account', desc: 'Go to elevenlabs.io and sign up for free.' },
      { title: 'Verify Email', desc: 'Confirm your email address via the verification link.' },
      { title: 'Open Profile', desc: 'Click your avatar at the bottom-left → Profile + API key.' },
      { title: 'Copy API Key', desc: 'Find your API key in the Profile section and copy it.' },
    ],
    sampleCode: `from elevenlabs.client import ElevenLabs\n\nclient = ElevenLabs(api_key="YOUR_KEY")\n\naudio = client.text_to_speech.convert(\n    voice_id="21m00Tcm4TlvDq8ikWAM",\n    text="Hello from ElevenLabs!",\n    model_id="eleven_multilingual_v2"\n)\nwith open("output.mp3", "wb") as f:\n    for chunk in audio:\n        f.write(chunk)`,
  },
  {
    id: 'huggingface',
    name: 'Hugging Face API',
    emoji: '🤗',
    color: '#ffcc00',
    badge: 'Open Source',
    description: '500K+ models for NLP, image, audio, and more via Inference API.',
    freeCredits: 'Free serverless inference (rate-limited)',
    pricingUrl: 'https://huggingface.co/pricing',
    docsUrl: 'https://huggingface.co/docs/api-inference',
    steps: [
      { title: 'Create Account', desc: 'Go to huggingface.co and sign up for a free account.' },
      { title: 'Go to Settings', desc: 'Click your avatar → Settings in the top-right.' },
      { title: 'Access Tokens', desc: 'Navigate to "Access Tokens" in the left sidebar.' },
      { title: 'Create Token', desc: 'Click "New token", name it, choose Read or Write, then click Generate.' },
      { title: 'Copy Token', desc: 'Copy the token — it will only be shown once.' },
    ],
    sampleCode: `import requests\n\nAPI_URL = "https://api-inference.huggingface.co/models/gpt2"\nheaders = {"Authorization": "Bearer YOUR_TOKEN"}\n\ndef query(payload):\n    response = requests.post(API_URL, headers=headers, json=payload)\n    return response.json()\n\noutput = query({"inputs": "Can you write a poem?"})\nprint(output)`,
  },
  {
    id: 'groq',
    name: 'Groq API',
    emoji: '⚡',
    color: '#f97316',
    badge: 'Ultra Fast',
    description: '500+ tokens/sec inference for Llama, Mixtral, and more models.',
    freeCredits: 'Free tier with generous rate limits',
    pricingUrl: 'https://groq.com/pricing',
    docsUrl: 'https://console.groq.com/docs',
    steps: [
      { title: 'Sign Up', desc: 'Visit console.groq.com and create an account.' },
      { title: 'Navigate to API Keys', desc: 'Click "API Keys" in the left sidebar.' },
      { title: 'Create Key', desc: 'Click "Create API Key", name it, and create.' },
      { title: 'Copy Key', desc: 'Copy the key before closing the dialog.' },
    ],
    sampleCode: `from groq import Groq\n\nclient = Groq(api_key="YOUR_KEY")\n\nchat_completion = client.chat.completions.create(\n    messages=[\n        {"role": "user", "content": "What is 2+2?"}\n    ],\n    model="llama-3.1-8b-instant",\n)\nprint(chat_completion.choices[0].message.content)`,
  },
]

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div style={{ position: 'relative', marginTop: 16 }}>
      <div style={{
        background: 'rgba(0,0,0,0.4)', borderRadius: 10,
        padding: '16px 18px', paddingRight: 48,
        border: '1px solid rgba(255,255,255,0.08)',
        fontFamily: 'monospace', fontSize: 12, lineHeight: 1.7,
        color: '#86efac', overflowX: 'auto',
        whiteSpace: 'pre',
      }}>
        {code}
      </div>
      <button onClick={copy} style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 7, padding: '5px 8px',
        cursor: 'pointer', color: 'rgba(245,240,230,0.6)',
        display: 'flex', alignItems: 'center', gap: 4, fontSize: 11,
      }}>
        {copied ? <><CheckCheck size={13} color="#34d399" /> Copied!</> : <><Copy size={13} /> Copy</>}
      </button>
    </div>
  )
}

export default function ApiKeyGuide() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(260,87%,3%)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(20,184,166,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '100px 32px 48px', textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 9999,
          background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.3)',
          marginBottom: 20, fontSize: 13, color: '#2dd4bf', fontWeight: 500,
        }}>
          🔑 API Key Creation Guides
        </div>
        <h1 style={{
          fontFamily: 'General Sans, sans-serif',
          fontSize: 'clamp(28px,5vw,54px)', fontWeight: 700,
          letterSpacing: '-0.03em', color: 'hsl(40,6%,95%)',
          marginBottom: 16,
        }}>
          Get Your AI API Keys
        </h1>
        <p style={{
          color: 'rgba(245,240,230,0.55)', fontSize: 17, maxWidth: 520,
          margin: '0 auto', lineHeight: 1.6,
        }}>
          Step-by-step guides to create API keys for every major AI platform. Never get stuck again.
        </p>
      </div>

      {/* Guides */}
      <div style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: '48px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {API_GUIDES.map(guide => {
            const isOpen = expanded === guide.id
            return (
              <div key={guide.id} className="glass-card" style={{
                borderRadius: 18, overflow: 'hidden',
                border: `1px solid ${isOpen ? guide.color + '35' : 'rgba(255,255,255,0.06)'}`,
                transition: 'border-color 0.3s',
              }}>
                {/* Header */}
                <button onClick={() => setExpanded(isOpen ? null : guide.id)} style={{
                  width: '100%', padding: '22px 28px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 16,
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, fontSize: 22, flexShrink: 0,
                    background: `${guide.color}18`, border: `1px solid ${guide.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {guide.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'General Sans, sans-serif', fontWeight: 700,
                        fontSize: 17, color: 'hsl(40,6%,95%)',
                      }}>
                        {guide.name}
                      </span>
                      <span style={{
                        fontSize: 11, padding: '2px 9px', borderRadius: 999,
                        background: `${guide.color}18`, color: guide.color,
                        border: `1px solid ${guide.color}30`, fontWeight: 600,
                      }}>
                        {guide.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(245,240,230,0.45)', marginTop: 4 }}>
                      {guide.description}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 12, color: '#34d399', fontWeight: 500,
                      background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                      padding: '4px 10px', borderRadius: 999,
                    }}>
                      {guide.freeCredits}
                    </span>
                    {isOpen ? <ChevronUp size={18} color="rgba(245,240,230,0.4)" /> : <ChevronDown size={18} color="rgba(245,240,230,0.4)" />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isOpen && (
                  <div style={{ padding: '0 28px 28px' }}>
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

                    {/* Steps */}
                    <h4 style={{ color: 'hsl(40,6%,95%)', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>
                      Step-by-Step Guide
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                      {guide.steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                            background: `${guide.color}20`, border: `1px solid ${guide.color}35`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'General Sans, sans-serif',
                            fontSize: 13, fontWeight: 700, color: guide.color,
                          }}>
                            {i + 1}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'hsl(40,6%,95%)', fontSize: 14, marginBottom: 4 }}>
                              {step.title}
                            </div>
                            <div style={{ color: 'rgba(245,240,230,0.55)', fontSize: 13, lineHeight: 1.5 }}>
                              {step.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Code Sample */}
                    <h4 style={{ color: 'hsl(40,6%,95%)', fontWeight: 600, marginBottom: 4, fontSize: 15 }}>
                      Quick Start Code (Python)
                    </h4>
                    <CodeBlock code={guide.sampleCode} />

                    {/* Links */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                      <a href={guide.docsUrl} target="_blank" rel="noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 18px', borderRadius: 10,
                        background: `${guide.color}15`, border: `1px solid ${guide.color}25`,
                        color: guide.color, textDecoration: 'none', fontSize: 13, fontWeight: 600,
                      }}>
                        <ExternalLink size={13} /> Official Docs
                      </a>
                      <a href={guide.pricingUrl} target="_blank" rel="noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 18px', borderRadius: 10,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(245,240,230,0.6)', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                      }}>
                        View Pricing
                      </a>
                      <Link to="/chat" style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '10px 18px', borderRadius: 10,
                        background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)',
                        color: '#c4b5fd', textDecoration: 'none', fontSize: 13, fontWeight: 600,
                      }}>
                        Ask AI Advisor
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 60, textAlign: 'center',
          padding: '48px 32px',
          background: 'rgba(20,184,166,0.06)',
          border: '1px solid rgba(20,184,166,0.15)',
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
          <h3 style={{
            fontFamily: 'General Sans, sans-serif', color: 'hsl(40,6%,95%)',
            fontSize: 24, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em',
          }}>
            Need a custom recommendation?
          </h3>
          <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: 15, marginBottom: 24 }}>
            Tell our AI Advisor your use case, and we'll guide you to the perfect API and help you get started.
          </p>
          <Link to="/chat" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 9999,
            background: 'linear-gradient(135deg, #14b8a6, #0891b2)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: 15,
          }}>
            Chat with AI Advisor →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
