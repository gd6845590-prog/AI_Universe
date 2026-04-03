from dotenv import load_dotenv
load_dotenv()

import os, bcrypt, jwt, uuid, logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from pathlib import Path
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from tinydb import TinyDB, Query
from tinydb.storages import JSONStorage
from tinydb.middlewares import CachingMiddleware


# ─── Setup ───────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

IS_PROD = os.environ.get("VERCEL_ENV") in {"production", "preview"} or os.environ.get("ENV") == "production"

# Vercel serverless has a read-only filesystem except /tmp.
default_db_path = "/tmp/db.json" if IS_PROD else "./data/db.json"
DB_PATH = Path(os.environ.get("DB_PATH", default_db_path))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)

db = TinyDB(str(DB_PATH), storage=CachingMiddleware(JSONStorage), indent=2)
users_table = db.table("users")
tools_table = db.table("tools")
cats_table  = db.table("categories")
chat_table  = db.table("chat_messages")
attempts_table = db.table("login_attempts")

app = FastAPI(title="AI Universe API")
api_router = APIRouter(prefix="/api")
Q = Query()

# ─── JWT helpers ─────────────────────────────────────────────────────────────
JWT_ALG = "HS256"

def _secret() -> str:
    return os.environ["JWT_SECRET"]

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def create_access_token(uid: str, email: str) -> str:
    return jwt.encode(
        {"sub": uid, "email": email, "type": "access",
         "exp": datetime.now(timezone.utc) + timedelta(hours=2)},
        _secret(), algorithm=JWT_ALG)

def create_refresh_token(uid: str) -> str:
    return jwt.encode(
        {"sub": uid, "type": "refresh",
         "exp": datetime.now(timezone.utc) + timedelta(days=7)},
        _secret(), algorithm=JWT_ALG)

def _get_user_by_id(uid: str) -> Optional[dict]:
    results = users_table.search(Q.id == uid)
    return results[0] if results else None

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        ah = request.headers.get("Authorization", "")
        if ah.startswith("Bearer "):
            token = ah[7:]
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALG])
        if payload.get("type") != "access":
            raise HTTPException(401, "Invalid token type")
        user = _get_user_by_id(payload["sub"])
        if not user:
            raise HTTPException(401, "User not found")
        safe = {k: v for k, v in user.items() if k != "password_hash"}
        return safe
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

# ─── Pydantic models ──────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ChatMsg(BaseModel):
    message: str
    session_id: Optional[str] = None

class RecommendReq(BaseModel):
    query: str
    budget: Optional[str] = None
    use_case: Optional[str] = None

class CompareReq(BaseModel):
    tool_slugs: list[str]


def _set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie(
        "access_token",
        access,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=7200,
        path="/",
    )
    response.set_cookie(
        "refresh_token",
        refresh,
        httponly=True,
        secure=IS_PROD,
        samesite="lax",
        max_age=604800,
        path="/",
    )

# ─── LLM Chat Helper ─────────────────────────────────────────────────────────
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "dummy")
LLM_API_KEY  = os.environ.get("LLM_API_KEY", "")

AI_SYSTEM = """You are AI Universe Assistant — an expert on all AI tools, APIs, and services.

You help users:
1. Find the best AI tools for their needs and budget
2. Compare tools with objective pros/cons  
3. Guide step-by-step API key creation for ANY provider (Gemini, OpenAI, Anthropic, etc.)
4. Recommend cost-effective solutions

Key tools you know:
- Chat: ChatGPT, Claude, Gemini, Grok, Perplexity
- Code: GitHub Copilot, Cursor, Replit, v0
- Image: Midjourney, Imagen 3 (Google), DALL-E 3, Stable Diffusion, Ideogram
- Video: Veo 3 (Google), Sora (OpenAI), Runway Gen-4
- Voice: ElevenLabs, Google TTS, Whisper
- APIs: Google Gemini API, OpenAI API, Anthropic API, Groq, AWS Bedrock

Format responses with markdown. Be concise, accurate, and helpful."""

DUMMY_RESPONSES = [
    "Based on your needs, here are top recommendations:\n\n- **ChatGPT (OpenAI)** — best all-around for writing, coding, analysis\n- **Claude (Anthropic)** — best for long documents & nuanced reasoning\n- **Gemini (Google)** — best for Google integration & multimodal tasks\n\n💡 All three have **free tiers** to get started!",
    "**Getting a Gemini API key:**\n1. Go to **aistudio.google.com/apikey**\n2. Sign in with your Google account\n3. Click **Create API Key**\n4. Copy your key and use it in your project\n\n**Free tier:** 15 requests/minute with Gemini 2.0 Flash — no credit card needed!",
    "I can compare tools for you! Key factors to consider:\n- **Price** — free tiers vs paid plans\n- **Features** — what capabilities matter most\n- **API access** — do you need programmatic access?\n- **Rate limits** — requests per minute/day\n\nTell me which tools to compare!",
    "**Best AI tools for image generation:**\n\n- **Imagen 3** (Google) — photorealistic, excellent text rendering, via Gemini API\n- **Midjourney** — best artistic quality, $10/month\n- **DALL-E 3** — best prompt adherence, via OpenAI API\n- **Stable Diffusion** — free, open-source, unlimited local use\n- **Ideogram** — best for logos & text in images\n\nAll available in our tools section! 🎨",
    "**Best AI tools for video generation:**\n\n- **Veo 3** (Google DeepMind) — state-of-the-art, native audio support\n- **Sora** (OpenAI) — up to 60-second videos, $20/month via ChatGPT Plus\n- **Runway Gen-4** — professional tools, motion control, $15/month\n\n🎬 Check our tools section for full details!",
    "**Best voice/TTS AI tools:**\n\n- **ElevenLabs** — most realistic, voice cloning, 10K chars/month free\n- **Google TTS** — 380+ voices, 50+ languages, 4M chars/month free\n- **OpenAI TTS** — 6 natural voices, $0.015/1K chars\n\nWhat's your use case — app, podcast, or video?",
]

_dummy_idx = 0

async def call_llm(system: str, history: list, user_message: str) -> str:
    global _dummy_idx
    provider = LLM_PROVIDER.lower()

    # ── OpenAI ───────────────────────────────────────────────────────────────
    if provider == "openai" and LLM_API_KEY and not LLM_API_KEY.startswith(("dummy","your-")):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=LLM_API_KEY)
            messages = [{"role": "system", "content": system}]
            for m in history[-20:]:
                messages.append({"role": m["role"], "content": m["content"]})
            messages.append({"role": "user", "content": user_message})
            resp = await client.chat.completions.create(
                model="gpt-4o-mini", messages=messages, max_tokens=1000)
            return resp.choices[0].message.content
        except Exception as e:
            logger.error(f"OpenAI error: {e}")

    # ── Groq (FREE tier — ultra-fast LPU inference) ──────────────────────────
    if provider == "groq" and LLM_API_KEY and not LLM_API_KEY.startswith(("dummy","your-")):
        try:
            from openai import AsyncOpenAI  # Groq is OpenAI-API-compatible
            client = AsyncOpenAI(api_key=LLM_API_KEY, base_url="https://api.groq.com/openai/v1")
            messages = [{"role": "system", "content": system}]
            for m in history[-20:]:
                messages.append({"role": m["role"], "content": m["content"]})
            messages.append({"role": "user", "content": user_message})
            resp = await client.chat.completions.create(
                model="llama-3.3-70b-versatile", messages=messages, max_tokens=1000)
            return resp.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq error: {e}")


    # ── Anthropic (Claude) ────────────────────────────────────────────────────
    if provider == "anthropic" and LLM_API_KEY and not LLM_API_KEY.startswith("dummy"):
        try:
            import httpx, json as _json
            msgs = []
            for m in history[-20:]:
                msgs.append({"role": m["role"], "content": m["content"]})
            msgs.append({"role": "user", "content": user_message})
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": LLM_API_KEY, "anthropic-version": "2023-06-01",
                             "content-type": "application/json"},
                    json={"model": "claude-haiku-20240307", "max_tokens": 1024,
                          "system": system, "messages": msgs},
                    timeout=30)
                data = resp.json()
                return data["content"][0]["text"]
        except Exception as e:
            logger.error(f"Anthropic error: {e}")

    # ── Google Gemini ─────────────────────────────────────────────────────────
    if provider == "gemini" and LLM_API_KEY and not LLM_API_KEY.startswith("dummy"):
        try:
            import httpx, json as _json
            # Build Gemini contents array from history
            contents = []
            for m in history[-20:]:
                role = "user" if m["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": m["content"]}]})
            contents.append({"role": "user", "parts": [{"text": user_message}]})

            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={LLM_API_KEY}",
                    headers={"content-type": "application/json"},
                    json={
                        "system_instruction": {"parts": [{"text": system}]},
                        "contents": contents,
                        "generationConfig": {"maxOutputTokens": 1024, "temperature": 0.7},
                    },
                )
                data = resp.json()
                if resp.status_code != 200:
                    logger.error(f"Gemini API error {resp.status_code}: {data}")
                else:
                    return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            logger.error(f"Gemini error: {e}")

    # ── Smart Dummy Fallback (fires only when LLM API fails/not configured) ──────
    msg_lower = user_message.lower()

    # Greeting
    if msg_lower.strip() in ["hi", "hello", "hey", "yo", "sup", "hii", "hai"]:
        return "👋 Hello! I'm the AI Universe Assistant. Ask me about any AI tool, API key, pricing, or get personalized recommendations!\n\n**Try asking:**\n- What's the best AI for video generation under $50?\n- How do I get a ChatGPT API key?\n- Compare Claude vs Gemini for coding"

    # Specific API key requests — detect WHICH provider they asked about
    if "chatgpt" in msg_lower or ("openai" in msg_lower and "api" in msg_lower):
        return "**Getting an OpenAI / ChatGPT API key:**\n1. Go to **platform.openai.com/api-keys**\n2. Sign in or create a free account\n3. Click **Create new secret key**\n4. Copy and save it — it's shown only once!\n\n**Free credits:** New accounts get $5 free to start\n**Pricing:** GPT-4o mini from $0.15/1M tokens"

    if "gemini" in msg_lower and ("key" in msg_lower or "api" in msg_lower):
        return "**Getting a Google Gemini API key:**\n1. Go to **aistudio.google.com/apikey**\n2. Sign in with your Google account\n3. Click **Create API Key**\n4. Copy the key — free to use!\n\n**Free tier:** 15 requests/minute, no credit card needed"

    if "anthropic" in msg_lower or "claude" in msg_lower and "api" in msg_lower:
        return "**Getting an Anthropic / Claude API key:**\n1. Go to **console.anthropic.com**\n2. Sign up / log in\n3. Go to **API Keys** → Create key\n\n**Pricing:** Claude Haiku from $0.25/1M input tokens"

    if "groq" in msg_lower and "api" in msg_lower:
        return "**Getting a Groq API key:**\n1. Go to **console.groq.com/keys**\n2. Sign up for free\n3. Click **Create API Key**\n\n**Free tier:** Very generous limits, ultra-fast inference (500+ tokens/sec)"

    # General API key help
    if any(w in msg_lower for w in ["api key", "how to get api", "create key", "api access", "get key"]):
        return "**Getting an API key — choose your provider:**\n\n- **OpenAI** → platform.openai.com/api-keys\n- **Google Gemini** → aistudio.google.com/apikey *(free, no card)*\n- **Anthropic** → console.anthropic.com/keys\n- **Groq** → console.groq.com/keys *(ultra-fast, free)*\n- **Hugging Face** → huggingface.co/settings/tokens\n\nWhich provider do you want the key for?"

    # Video generation
    if any(w in msg_lower for w in ["video", "veo", "sora", "runway", "film", "movie"]):
        return "**Best AI for video generation under $50/month:**\n\n- 🎬 **Runway Gen-4** — $15/month Standard, $35/month Pro. Best professional tools, motion control\n- 🎭 **Sora (OpenAI)** — $20/month via ChatGPT Plus. Up to 60-second videos\n- 🌟 **Veo 3 (Google)** — Enterprise pricing, state-of-the-art quality with native audio\n\n**Free options:**\n- Runway: 125 free credits to start\n- Kling AI: 166 free credits/month\n\nFor under $50/month, **Runway Gen-4 Standard ($15)** is the best value!"

    # Image generation
    if any(w in msg_lower for w in ["image", "picture", "art", "photo", "generate image", "imagen", "midjourney", "dall"]):
        return "**Best AI image generation tools:**\n\n- 🎨 **Midjourney** — best artistic quality, $10/month Basic\n- 🖼️ **Imagen 3** (Google) — photorealistic, $0.04/image via Gemini API\n- 🎯 **DALL-E 3** — best prompt adherence, via OpenAI API ($0.04/image)\n- 🆓 **Stable Diffusion** — free, open-source, unlimited local use\n- 📝 **Ideogram** — best for text in images / logos, free tier available"

    # TTS / Voice
    if any(w in msg_lower for w in ["tts", "text to speech", "voice", "speech", "audio", "elevenlabs", "whisper"]):
        return "**Best AI voice/TTS tools:**\n\n- 🎙️ **ElevenLabs** — most realistic, voice cloning, 10K chars/month free\n- 🔊 **Google TTS** — 380+ voices, 50+ languages, 4M chars/month free\n- 🤖 **OpenAI TTS** — 6 natural voices, $0.015/1K chars\n- 📝 **Whisper** (OpenAI) — best speech-to-text, open source & free"

    # Compare
    if any(w in msg_lower for w in ["compare", "vs", "versus", "difference", "better", "which is best"]):
        return "I can compare AI tools for you! Key factors to consider:\n\n- **Price** — free tiers vs paid plans\n- **Speed** — response latency and rate limits\n- **Quality** — accuracy and capabilities\n- **API access** — can you integrate it into your app?\n\nTell me which specific tools to compare (e.g. *ChatGPT vs Claude*) and I'll give you a detailed breakdown!"

    # Coding
    if any(w in msg_lower for w in ["code", "coding", "programming", "developer", "ide", "cursor", "copilot"]):
        return "**Best AI coding tools:**\n\n- 💻 **Cursor** — best AI IDE, full codebase context, $20/month Pro\n- 🤖 **GitHub Copilot** — great autocomplete in VS Code, $10/month\n- 🌐 **Replit AI** — browser-based, instant deploy, $25/month\n- ⚡ **Claude** — best for complex code review & architecture"

    # Default — general recommendation
    return "Based on your needs, here are the top AI tools to explore:\n\n- **ChatGPT (OpenAI)** — best all-around for writing, coding, analysis\n- **Claude (Anthropic)** — best for long documents & nuanced reasoning  \n- **Gemini (Google)** — best for Google integration & multimodal tasks\n- **Perplexity** — best for research with cited real-time answers\n\n💡 Use the **Compare** feature to see a detailed side-by-side comparison!\n\nWhat specific use case are you looking for?"



# ─── Tools seed data ─────────────────────────────────────────────────────────
TOOLS_DATA = [
    {"name":"ChatGPT","slug":"chatgpt","category":"Chat & Conversational AI","description":"World's most popular AI assistant by OpenAI for writing, coding, analysis and more.","features":["Multi-turn conversations","Code generation","Image analysis","Web browsing","Custom GPTs","Voice mode"],"pricing":{"free_tier":True,"free_details":"Free with GPT-4o mini","paid_plans":[{"name":"Plus","price":"$20/month"},{"name":"Pro","price":"$200/month"}]},"api_available":True,"api_pricing":"$0.15/1M tokens (mini)","api_guide_url":"https://platform.openai.com/api-keys","url":"https://chat.openai.com","icon":"C","icon_color":"#10a37f","rating":4.8,"popularity":99,"accuracy_score":95,"tags":["chat","writing","coding","popular"],"use_cases":["Customer support","Content creation","Code review","Research"],"provider":"OpenAI","launch_year":2022,"monthly_users":"200M+","is_api":False},
    {"name":"Claude","slug":"claude","category":"Chat & Conversational AI","description":"Anthropic's safety-focused AI with 200K context window and nuanced reasoning.","features":["200K context window","Document analysis","Code generation","Vision capabilities","Project memory"],"pricing":{"free_tier":True,"free_details":"Free with Claude Haiku","paid_plans":[{"name":"Pro","price":"$20/month"},{"name":"Team","price":"$30/user/month"}]},"api_available":True,"api_pricing":"$0.25/1M input tokens (Haiku)","api_guide_url":"https://console.anthropic.com/keys","url":"https://claude.ai","icon":"C","icon_color":"#cc785c","rating":4.9,"popularity":88,"accuracy_score":93,"tags":["chat","safety","long-context","reasoning"],"use_cases":["Document analysis","Legal review","Code review","Research"],"provider":"Anthropic","launch_year":2023,"monthly_users":"20M+","is_api":False},
    {"name":"Gemini","slug":"gemini","category":"Chat & Conversational AI","description":"Google's multimodal AI with 1M token context and deep Google workspace integration.","features":["Multimodal (text, image, audio)","1M context window","Google integration","Code execution","Real-time web search"],"pricing":{"free_tier":True,"free_details":"Free with Gemini 2.0 Flash","paid_plans":[{"name":"Advanced","price":"$19.99/month"}]},"api_available":True,"api_pricing":"Free tier: 15 RPM. Paid from $0.075/1M tokens","api_guide_url":"https://aistudio.google.com/apikey","url":"https://gemini.google.com","icon":"G","icon_color":"#4285f4","rating":4.7,"popularity":90,"accuracy_score":91,"tags":["chat","multimodal","google","search"],"use_cases":["Research","Writing","Data analysis","Google Workspace productivity"],"provider":"Google","launch_year":2023,"monthly_users":"100M+","is_api":False},
    {"name":"Grok","slug":"grok","category":"Chat & Conversational AI","description":"xAI's AI assistant with real-time X data and image generation.","features":["Real-time X data","Image generation","Unfiltered mode","Code generation","Web search"],"pricing":{"free_tier":True,"free_details":"Free on X with limited queries","paid_plans":[{"name":"X Premium","price":"$8/month"}]},"api_available":True,"api_pricing":"$5/1M input tokens","api_guide_url":"https://console.x.ai","url":"https://x.ai/grok","icon":"G","icon_color":"#1d9bf0","rating":4.4,"popularity":75,"accuracy_score":87,"tags":["chat","real-time","twitter","unfiltered"],"use_cases":["Real-time news","Social media analysis","Casual chat","Coding"],"provider":"xAI","launch_year":2023,"monthly_users":"10M+","is_api":False},
    {"name":"Microsoft Copilot","slug":"copilot","category":"Chat & Conversational AI","description":"Microsoft's GPT-4-powered AI integrated across Office 365, Windows and Edge.","features":["Windows integration","Office 365 integration","Image generation","Web search","Code generation"],"pricing":{"free_tier":True,"free_details":"Free with Microsoft account","paid_plans":[{"name":"M365 Copilot","price":"$30/user/month"}]},"api_available":True,"api_pricing":"Via Azure OpenAI Service","api_guide_url":"https://azure.microsoft.com/en-us/products/ai-services/openai-service","url":"https://copilot.microsoft.com","icon":"M","icon_color":"#0078d4","rating":4.5,"popularity":85,"accuracy_score":88,"tags":["chat","microsoft","office","windows"],"use_cases":["Office productivity","Email writing","Code completion","Research"],"provider":"Microsoft","launch_year":2023,"monthly_users":"50M+","is_api":False},
    {"name":"Perplexity AI","slug":"perplexity","category":"Chat & Conversational AI","description":"AI-powered search engine that provides cited, real-time answers from the web.","features":["Cited answers","Real-time web search","File analysis","Deep research mode","Multi-LLM support"],"pricing":{"free_tier":True,"free_details":"Free tier available","paid_plans":[{"name":"Pro","price":"$20/month"}]},"api_available":True,"api_pricing":"$0.2/1M tokens (Sonar)","api_guide_url":"https://www.perplexity.ai/settings/api","url":"https://www.perplexity.ai","icon":"P","icon_color":"#20b2aa","rating":4.6,"popularity":80,"accuracy_score":89,"tags":["search","research","real-time","citations"],"use_cases":["Research","Fact-checking","Market research","Academic research"],"provider":"Perplexity AI","launch_year":2022,"monthly_users":"15M+","is_api":False},
    {"name":"GitHub Copilot","slug":"github-copilot","category":"Code & Development","description":"AI pair programmer by GitHub integrated into VS Code, JetBrains and more.","features":["Code completion","Function generation","Bug fixing","Code explanation","Test generation","Multi-language support"],"pricing":{"free_tier":True,"free_details":"Free for students and open source maintainers","paid_plans":[{"name":"Individual","price":"$10/month"},{"name":"Business","price":"$19/user/month"}]},"api_available":False,"api_pricing":None,"api_guide_url":"https://github.com/features/copilot","url":"https://github.com/features/copilot","icon":"G","icon_color":"#6e40c9","rating":4.6,"popularity":90,"accuracy_score":88,"tags":["coding","ide","github","autocomplete"],"use_cases":["Code completion","Rapid prototyping","Test writing","Documentation"],"provider":"GitHub/Microsoft","launch_year":2021,"monthly_users":"15M+","is_api":False},
    {"name":"Cursor","slug":"cursor","category":"Code & Development","description":"AI-first code editor with full codebase context for smart multi-file generation.","features":["Full codebase context","Multi-file editing","Natural language to code","Auto-debug","Code explanation","VS Code compatible"],"pricing":{"free_tier":True,"free_details":"Free with limited pro features","paid_plans":[{"name":"Pro","price":"$20/month"},{"name":"Business","price":"$40/user/month"}]},"api_available":False,"api_pricing":None,"api_guide_url":"https://cursor.sh","url":"https://cursor.sh","icon":"C","icon_color":"#8b5cf6","rating":4.8,"popularity":85,"accuracy_score":91,"tags":["coding","ide","vscode","codebase"],"use_cases":["Full-stack development","Rapid prototyping","Code refactoring"],"provider":"Anysphere","launch_year":2023,"monthly_users":"4M+","is_api":False},
    {"name":"Replit AI","slug":"replit","category":"Code & Development","description":"Browser-based AI coding environment for building and deploying apps instantly.","features":["Browser-based coding","Instant deployment","AI code generation","Multi-language support","Collaboration"],"pricing":{"free_tier":True,"free_details":"Free with basic AI features","paid_plans":[{"name":"Core","price":"$25/month"}]},"api_available":False,"api_pricing":None,"api_guide_url":"https://replit.com","url":"https://replit.com","icon":"R","icon_color":"#f6740b","rating":4.5,"popularity":78,"accuracy_score":85,"tags":["coding","browser-based","deployment","education"],"use_cases":["Learning to code","Rapid prototyping","Teaching"],"provider":"Replit","launch_year":2016,"monthly_users":"30M+","is_api":False},
    {"name":"Lovable","slug":"lovable","category":"Website & App Builders","description":"AI platform to build full-stack React + Supabase web apps from natural language.","features":["Natural language to app","React + Supabase","Instant deployment","Real-time preview","GitHub sync"],"pricing":{"free_tier":True,"free_details":"5 free messages/day","paid_plans":[{"name":"Starter","price":"$20/month"}]},"api_available":False,"api_pricing":None,"api_guide_url":"https://lovable.dev","url":"https://lovable.dev","icon":"L","icon_color":"#ff4d6d","rating":4.7,"popularity":80,"accuracy_score":86,"tags":["app-builder","no-code","react","fullstack"],"use_cases":["Startup MVPs","Internal tools","Landing pages","Web apps"],"provider":"Lovable","launch_year":2023,"monthly_users":"500K+","is_api":False},
    {"name":"Bolt","slug":"bolt","category":"Website & App Builders","description":"StackBlitz's in-browser AI for generating and deploying full-stack apps instantly.","features":["In-browser execution","Full-stack support","npm package support","Instant deployment","Real-time collaboration"],"pricing":{"free_tier":True,"free_details":"Free with limited tokens","paid_plans":[{"name":"Pro","price":"$20/month"}]},"api_available":False,"api_pricing":None,"api_guide_url":"https://bolt.new","url":"https://bolt.new","icon":"B","icon_color":"#fbbf24","rating":4.6,"popularity":78,"accuracy_score":85,"tags":["app-builder","browser-based","fullstack","deploy"],"use_cases":["Rapid prototyping","Demo apps","MVPs"],"provider":"StackBlitz","launch_year":2024,"monthly_users":"2M+","is_api":False},
    {"name":"Vercel v0","slug":"v0","category":"Website & App Builders","description":"Vercel's AI UI generator producing React + shadcn/UI + Tailwind components.","features":["React component generation","shadcn/UI integration","Tailwind CSS","Copy & paste components","Responsive design"],"pricing":{"free_tier":True,"free_details":"Free with monthly credits","paid_plans":[{"name":"Premium","price":"$20/month"}]},"api_available":False,"api_pricing":None,"api_guide_url":"https://v0.dev","url":"https://v0.dev","icon":"V","icon_color":"#000000","rating":4.6,"popularity":76,"accuracy_score":87,"tags":["ui-generation","react","shadcn","tailwind"],"use_cases":["UI components","Landing pages","Dashboard components"],"provider":"Vercel","launch_year":2023,"monthly_users":"1M+","is_api":False},
    {"name":"Base44","slug":"base44","category":"Website & App Builders","description":"No-code AI platform for building internal tools and business apps.","features":["Visual builder","AI assistance","API integrations","Database management","Custom domains"],"pricing":{"free_tier":True,"free_details":"Free plan","paid_plans":[{"name":"Starter","price":"$15/month"},{"name":"Growth","price":"$49/month"}]},"api_available":False,"api_pricing":None,"api_guide_url":"https://base44.com","url":"https://base44.com","icon":"B","icon_color":"#0ea5e9","rating":4.4,"popularity":60,"accuracy_score":82,"tags":["app-builder","no-code","visual","drag-drop"],"use_cases":["Business apps","Internal tools","Customer portals"],"provider":"Base44","launch_year":2024,"monthly_users":"200K+","is_api":False},
    {"name":"Midjourney","slug":"midjourney","category":"Image Generation","description":"The most popular AI art generator known for stunning photorealism and artistic quality.","features":["Text to image","Image to image","Upscaling","Variations","Style references","Character consistency"],"pricing":{"free_tier":False,"free_details":"No free tier","paid_plans":[{"name":"Basic","price":"$10/month"},{"name":"Standard","price":"$30/month"},{"name":"Pro","price":"$60/month"}]},"api_available":False,"api_pricing":"Not publicly available","api_guide_url":"https://docs.midjourney.com","url":"https://midjourney.com","icon":"M","icon_color":"#0d0d0d","rating":4.8,"popularity":92,"accuracy_score":96,"tags":["image","art","photorealism","popular"],"use_cases":["Marketing","Art creation","Game design","Product visualization","Concept art"],"provider":"Midjourney Inc","launch_year":2022,"monthly_users":"20M+","is_api":False},
    {"name":"DALL-E 3","slug":"dall-e","category":"Image Generation","description":"OpenAI's image generation with precise prompt adherence, integrated in ChatGPT.","features":["Precise prompt following","ChatGPT integration","Multiple sizes","Vivid/Natural styles","API access"],"pricing":{"free_tier":True,"free_details":"Via ChatGPT free","paid_plans":[{"name":"API","price":"$0.04/image (standard)"}]},"api_available":True,"api_pricing":"$0.04/image (1024x1024)","api_guide_url":"https://platform.openai.com/api-keys","url":"https://openai.com/dall-e-3","icon":"D","icon_color":"#10a37f","rating":4.7,"popularity":82,"accuracy_score":90,"tags":["image","openai","api","creative"],"use_cases":["Marketing","Content creation","Product mockups","Educational"],"provider":"OpenAI","launch_year":2023,"monthly_users":"50M+ (via ChatGPT)","is_api":True},
    {"name":"Stable Diffusion","slug":"stable-diffusion","category":"Image Generation","description":"Open-source text-to-image AI with unlimited local generation and no subscription.","features":["Open source","Local generation","Unlimited use","ControlNet","LoRA fine-tuning","Inpainting"],"pricing":{"free_tier":True,"free_details":"Free to use locally","paid_plans":[{"name":"Stability AI API","price":"$10 credits"}]},"api_available":True,"api_pricing":"Free (self-hosted) or $0.065/image (API)","api_guide_url":"https://platform.stability.ai","url":"https://stability.ai","icon":"S","icon_color":"#7c3aed","rating":4.5,"popularity":85,"accuracy_score":88,"tags":["image","open-source","local","free"],"use_cases":["Art creation","Game assets","Marketing","Research","Custom models"],"provider":"Stability AI","launch_year":2022,"monthly_users":"10M+","is_api":True},
    {"name":"Ideogram AI","slug":"ideogram","category":"Image Generation","description":"AI image generator excelling at text rendering within images — perfect for logos and posters.","features":["Accurate text rendering","Logo generation","Poster design","Inpainting","Style options","API access"],"pricing":{"free_tier":True,"free_details":"25 slow generations/day","paid_plans":[{"name":"Basic","price":"$7/month"},{"name":"Plus","price":"$16/month"}]},"api_available":True,"api_pricing":"$0.08/image","api_guide_url":"https://ideogram.ai/manage-api","url":"https://ideogram.ai","icon":"I","icon_color":"#6366f1","rating":4.6,"popularity":68,"accuracy_score":88,"tags":["image","text-rendering","logo","design"],"use_cases":["Logo design","Poster creation","Marketing","Typography"],"provider":"Ideogram","launch_year":2023,"monthly_users":"5M+","is_api":True},
    {"name":"Sora","slug":"sora","category":"Video Generation","description":"OpenAI's text-to-video model generating realistic videos up to 60 seconds.","features":["Text to video","Image to video","60s videos","1080p quality","Multiple characters","Complex scenes"],"pricing":{"free_tier":False,"free_details":"No free tier","paid_plans":[{"name":"ChatGPT Plus","price":"$20/month"},{"name":"ChatGPT Pro","price":"$200/month"}]},"api_available":False,"api_pricing":"Coming soon","api_guide_url":"https://sora.com","url":"https://sora.com","icon":"S","icon_color":"#10a37f","rating":4.7,"popularity":82,"accuracy_score":90,"tags":["video","openai","text-to-video","photorealism"],"use_cases":["Marketing videos","Film production","Social media","Creative content"],"provider":"OpenAI","launch_year":2024,"monthly_users":"500K+","is_api":False},
    {"name":"Runway Gen-4","slug":"runway-ml","category":"Video Generation","description":"Professional AI video generation with advanced motion control and editing tools.","features":["Text to video","Image to video","Motion brush","Camera control","Video editing","Style transfer"],"pricing":{"free_tier":True,"free_details":"125 free credits","paid_plans":[{"name":"Standard","price":"$15/month"},{"name":"Pro","price":"$35/month"}]},"api_available":True,"api_pricing":"$0.05/second of video","api_guide_url":"https://docs.runwayml.com","url":"https://runwayml.com","icon":"R","icon_color":"#5b21b6","rating":4.6,"popularity":78,"accuracy_score":88,"tags":["video","editing","motion","professional"],"use_cases":["Marketing videos","Social media","Film production","Brand content"],"provider":"Runway","launch_year":2022,"monthly_users":"3M+","is_api":True},
    {"name":"Veo 3","slug":"gemini-veo","category":"Video Generation","description":"Google DeepMind's state-of-the-art video gen model with native audio support.","features":["Text to video","Native audio generation","High resolution","Multiple styles","Camera controls"],"pricing":{"free_tier":False,"free_details":"Enterprise access","paid_plans":[{"name":"API","price":"Usage-based pricing"}]},"api_available":True,"api_pricing":"Enterprise pricing","api_guide_url":"https://deepmind.google/technologies/veo","url":"https://deepmind.google/technologies/veo","icon":"V","icon_color":"#4285f4","rating":4.8,"popularity":65,"accuracy_score":92,"tags":["video","google","audio","state-of-the-art"],"use_cases":["Film production","Advertising","Entertainment","Education"],"provider":"Google DeepMind","launch_year":2024,"monthly_users":"1M+","is_api":True},
    {"name":"ElevenLabs","slug":"elevenlabs","category":"Voice & Audio","description":"The most realistic AI voice generation with voice cloning in 29+ languages.","features":["Realistic TTS","Voice cloning","29+ languages","Speech to text","Dubbing","Voice design","Real-time conversion"],"pricing":{"free_tier":True,"free_details":"10,000 chars/month","paid_plans":[{"name":"Starter","price":"$5/month"},{"name":"Creator","price":"$22/month"},{"name":"Pro","price":"$99/month"}]},"api_available":True,"api_pricing":"$0.30/1K chars","api_guide_url":"https://elevenlabs.io/app/settings/api-keys","url":"https://elevenlabs.io","icon":"E","icon_color":"#f59e0b","rating":4.9,"popularity":85,"accuracy_score":95,"tags":["tts","voice-cloning","audio","api"],"use_cases":["Audiobooks","Podcasts","Video voiceover","Apps","Gaming"],"provider":"ElevenLabs","launch_year":2022,"monthly_users":"2M+","is_api":True},
    {"name":"Google Text-to-Speech","slug":"google-tts","category":"Voice & Audio","description":"Google Cloud TTS API with 380+ voices in 50+ languages for enterprise apps.","features":["380+ voices","50+ languages","SSML support","Neural2 voices","Studio quality","WaveNet voices"],"pricing":{"free_tier":True,"free_details":"4M chars/month free","paid_plans":[{"name":"Standard","price":"$4/1M chars"},{"name":"WaveNet","price":"$16/1M chars"}]},"api_available":True,"api_pricing":"$4/1M chars (standard), $16/1M chars (WaveNet)","api_guide_url":"https://console.cloud.google.com/apis/library/texttospeech.googleapis.com","url":"https://cloud.google.com/text-to-speech","icon":"G","icon_color":"#4285f4","rating":4.7,"popularity":80,"accuracy_score":91,"tags":["tts","google","api","enterprise","multilingual"],"use_cases":["Apps","Accessibility","IVR systems","E-learning","Navigation"],"provider":"Google Cloud","launch_year":2018,"monthly_users":"Millions","is_api":True},
    {"name":"OpenAI Whisper","slug":"whisper","category":"Voice & Audio","description":"OpenAI's open-source ASR with near-human accuracy across 99 languages.","features":["99 languages","Near-human accuracy","Open source","Timestamps","Noise robustness","API access"],"pricing":{"free_tier":True,"free_details":"Open source, self-host free","paid_plans":[{"name":"API","price":"$0.006/minute"}]},"api_available":True,"api_pricing":"$0.006/minute of audio","api_guide_url":"https://platform.openai.com/api-keys","url":"https://openai.com/whisper","icon":"W","icon_color":"#10a37f","rating":4.8,"popularity":78,"accuracy_score":94,"tags":["stt","transcription","openai","open-source"],"use_cases":["Transcription","Meeting notes","Accessibility","Voice apps"],"provider":"OpenAI","launch_year":2022,"monthly_users":"Millions","is_api":True},
    {"name":"OpenAI API","slug":"openai-api","category":"API Keys & Cloud AI","description":"OpenAI's API: GPT-4o, DALL-E 3, Whisper, TTS, and embeddings for developers.","features":["GPT-4o models","DALL-E 3 image gen","Whisper STT","TTS voices","Embeddings","Fine-tuning","Assistant API"],"pricing":{"free_tier":True,"free_details":"$5 free credits on signup","paid_plans":[{"name":"GPT-4o","price":"$2.50/1M input tokens"},{"name":"GPT-4o-mini","price":"$0.15/1M input tokens"}]},"api_available":True,"api_pricing":"From $0.15/1M tokens","api_guide_url":"https://platform.openai.com/api-keys","url":"https://platform.openai.com","icon":"O","icon_color":"#10a37f","rating":4.9,"popularity":99,"accuracy_score":97,"tags":["api","llm","openai","most-popular"],"use_cases":["Chatbots","Code generation","Content creation","Analysis","Apps"],"provider":"OpenAI","launch_year":2020,"monthly_users":"Millions","is_api":True},
    {"name":"Anthropic API","slug":"anthropic-api","category":"API Keys & Cloud AI","description":"Claude API for safe, capable AI with 200K context and nuanced reasoning.","features":["Claude 3.5 Sonnet, Opus, Haiku","200K context window","Vision","Tool use","Streaming","Safety focus"],"pricing":{"free_tier":False,"free_details":"Pay-as-you-go","paid_plans":[{"name":"Claude Haiku","price":"$0.25/1M input tokens"},{"name":"Claude Sonnet","price":"$3/1M input tokens"},{"name":"Claude Opus","price":"$15/1M input tokens"}]},"api_available":True,"api_pricing":"From $0.25/1M tokens","api_guide_url":"https://console.anthropic.com/keys","url":"https://console.anthropic.com","icon":"A","icon_color":"#cc785c","rating":4.8,"popularity":85,"accuracy_score":95,"tags":["api","llm","anthropic","safety"],"use_cases":["Chatbots","Document analysis","Code review","Enterprise apps"],"provider":"Anthropic","launch_year":2023,"monthly_users":"Millions","is_api":True},
    {"name":"Google Gemini API","slug":"google-gemini-api","category":"API Keys & Cloud AI","description":"Google's Gemini API with generous free tier, multimodal, and 1M context.","features":["Gemini 2.0 Flash/Pro","1M context window","Multimodal","Code execution","Google Search grounding","Streaming"],"pricing":{"free_tier":True,"free_details":"15 RPM free on Gemini 2.0 Flash","paid_plans":[{"name":"Gemini 2.0 Flash","price":"$0.075/1M input tokens"},{"name":"Gemini 2.0 Pro","price":"$1.25/1M input tokens"}]},"api_available":True,"api_pricing":"From $0.075/1M tokens","api_guide_url":"https://aistudio.google.com/apikey","url":"https://ai.google.dev","icon":"G","icon_color":"#4285f4","rating":4.7,"popularity":88,"accuracy_score":93,"tags":["api","llm","google","multimodal","free-tier"],"use_cases":["Chatbots","Multimodal apps","Code generation","Research"],"provider":"Google","launch_year":2024,"monthly_users":"Millions","is_api":True},
    {"name":"Hugging Face","slug":"hugging-face","category":"API Keys & Cloud AI","description":"The GitHub of AI – 500K+ models, datasets, and Inference API for developers.","features":["500K+ models","Datasets hub","Inference API","Spaces for demos","AutoTrain","Fine-tuning"],"pricing":{"free_tier":True,"free_details":"Free Inference API (rate limited)","paid_plans":[{"name":"PRO","price":"$9/month"},{"name":"Enterprise Hub","price":"$20/user/month"}]},"api_available":True,"api_pricing":"Free tier + pay-per-use","api_guide_url":"https://huggingface.co/settings/tokens","url":"https://huggingface.co","icon":"H","icon_color":"#ffd21e","rating":4.7,"popularity":90,"accuracy_score":88,"tags":["api","open-source","models","hub"],"use_cases":["Model deployment","Research","Fine-tuning","AI demos","Education"],"provider":"Hugging Face","launch_year":2016,"monthly_users":"10M+","is_api":True},
    {"name":"Groq API","slug":"groq","category":"API Keys & Cloud AI","description":"Ultra-fast LLM inference – 500+ tokens/sec with open-source models on LPU.","features":["500+ tokens/second","Open source models","Llama 3 70B","Mixtral support","Low latency","Free tier"],"pricing":{"free_tier":True,"free_details":"Free tier with rate limits","paid_plans":[{"name":"Llama 3 70B","price":"$0.59/1M input tokens"},{"name":"Mixtral 8x7B","price":"$0.24/1M input tokens"}]},"api_available":True,"api_pricing":"From $0.24/1M tokens","api_guide_url":"https://console.groq.com/keys","url":"https://groq.com","icon":"G","icon_color":"#f97316","rating":4.7,"popularity":72,"accuracy_score":86,"tags":["api","fast","llama","open-source","inference"],"use_cases":["Real-time chat","Low-latency apps","Cost-effective AI"],"provider":"Groq","launch_year":2023,"monthly_users":"500K+","is_api":True},
    {"name":"AWS Bedrock","slug":"aws-bedrock","category":"API Keys & Cloud AI","description":"AWS managed service for Claude, Llama, Mistral and more foundation models.","features":["Multiple LLM access","Claude on Bedrock","Llama on Bedrock","Fine-tuning","RAG with Knowledge Bases","Agents","Enterprise security"],"pricing":{"free_tier":False,"free_details":"Pay-as-you-go","paid_plans":[{"name":"On-demand","price":"Per model pricing"}]},"api_available":True,"api_pricing":"Per token, varies by model","api_guide_url":"https://console.aws.amazon.com/bedrock","url":"https://aws.amazon.com/bedrock","icon":"A","icon_color":"#ff9900","rating":4.6,"popularity":72,"accuracy_score":90,"tags":["api","aws","enterprise","foundation-models"],"use_cases":["Enterprise AI","RAG","Fine-tuning","Multi-model access"],"provider":"Amazon Web Services","launch_year":2023,"monthly_users":"Millions","is_api":True},
    {"name":"Azure OpenAI","slug":"azure-openai","category":"API Keys & Cloud AI","description":"OpenAI models (GPT-4, DALL-E, Whisper) via Azure with enterprise security.","features":["OpenAI models via Azure","Enterprise security","RBAC","Virtual networks","Content filtering","SLA"],"pricing":{"free_tier":False,"free_details":"Pay-as-you-go","paid_plans":[{"name":"GPT-4o","price":"$2.50/1M input tokens"},{"name":"GPT-4o mini","price":"$0.15/1M input tokens"}]},"api_available":True,"api_pricing":"Same as OpenAI with Azure pricing","api_guide_url":"https://portal.azure.com","url":"https://azure.microsoft.com/en-us/products/ai-services/openai-service","icon":"A","icon_color":"#0078d4","rating":4.6,"popularity":75,"accuracy_score":93,"tags":["api","azure","microsoft","enterprise","openai"],"use_cases":["Enterprise apps","Compliance-required AI","Government","Healthcare"],"provider":"Microsoft Azure","launch_year":2023,"monthly_users":"Millions","is_api":True},
    {"name":"Imagen 3","slug":"imagen-3","category":"Image Generation","description":"Google DeepMind's latest text-to-image model with photorealistic quality and precise text rendering, available via Gemini API.","features":["Photorealistic images","Precise text rendering","Multiple aspect ratios","Style control","Safety filters","Gemini API access"],"pricing":{"free_tier":True,"free_details":"Available via Google AI Studio free tier","paid_plans":[{"name":"Gemini API","price":"$0.04/image (1024x1024)"}]},"api_available":True,"api_pricing":"$0.04/image via Gemini API","api_guide_url":"https://aistudio.google.com/apikey","url":"https://deepmind.google/technologies/imagen-3","icon":"I","icon_color":"#4285f4","rating":4.7,"popularity":72,"accuracy_score":93,"tags":["image","google","photorealistic","api","text-rendering"],"use_cases":["Product visualization","Marketing","Art creation","Content creation","Logo design"],"provider":"Google DeepMind","launch_year":2024,"monthly_users":"Millions","is_api":True},
]

CATEGORIES_DATA = [
    {"name":"Chat & Conversational AI","slug":"chat-ai","description":"AI chatbots and conversational assistants","icon":"MessageSquare","color":"#6366f1"},
    {"name":"Code & Development","slug":"code-dev","description":"AI tools for coding, debugging and development","icon":"Code","color":"#22d3ee"},
    {"name":"Website & App Builders","slug":"website-builders","description":"AI platforms for building websites and apps","icon":"Globe","color":"#f59e0b"},
    {"name":"Image Generation","slug":"image-gen","description":"AI tools for generating and editing images","icon":"Image","color":"#ec4899"},
    {"name":"Video Generation","slug":"video-gen","description":"AI tools for generating and editing videos","icon":"Video","color":"#f97316"},
    {"name":"Voice & Audio","slug":"voice-audio","description":"Text-to-speech, speech-to-text and voice AI","icon":"Mic","color":"#10b981"},
    {"name":"API Keys & Cloud AI","slug":"api-cloud","description":"AI APIs and cloud services for developers","icon":"Key","color":"#8b5cf6"},
]

# ─── Auth endpoints ──────────────────────────────────────────────────────────
@api_router.post("/auth/register")
@api_router.post("/auth/signup")
async def register(data: UserRegister, response: Response):
    email = data.email.lower().strip()
    if users_table.search(Q.email == email):
        raise HTTPException(400, "Email already registered")
    uid = str(uuid.uuid4())
    user_doc = {
        "id": uid, "name": data.name, "email": email,
        "password_hash": hash_password(data.password),
        "role": "user", "saved_tools": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    users_table.insert(user_doc)
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    _set_auth_cookies(response, access, refresh)
    return {"id": uid, "name": data.name, "email": email, "role": "user", "saved_tools": []}

@api_router.post("/auth/login")
@api_router.post("/auth/signin")
async def login(data: UserLogin, response: Response, request: Request):
    email = data.email.lower().strip()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"

    # Rate limiting
    attempt = attempts_table.get(Q.identifier == identifier)
    if attempt and attempt.get("count", 0) >= 5:
        locked_until = attempt.get("locked_until")
        if locked_until:
            try:
                locked_dt = datetime.fromisoformat(locked_until)
                if locked_dt.tzinfo is None:
                    locked_dt = locked_dt.replace(tzinfo=timezone.utc)
                if locked_dt > datetime.now(timezone.utc):
                    raise HTTPException(429, "Too many attempts. Try again in 15 minutes.")
            except (ValueError, TypeError):
                pass

    results = users_table.search(Q.email == email)
    user = results[0] if results else None
    if not user or not verify_password(data.password, user["password_hash"]):
        count = (attempt.get("count", 0) + 1) if attempt else 1
        locked_until = None
        if count >= 5:
            locked_until = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
        if attempt:
            attempts_table.update({"count": count, "locked_until": locked_until}, Q.identifier == identifier)
        else:
            attempts_table.insert({"identifier": identifier, "count": count, "locked_until": locked_until})
        raise HTTPException(401, "Invalid email or password")

    attempts_table.remove(Q.identifier == identifier)
    uid = user["id"]
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    _set_auth_cookies(response, access, refresh)
    safe = {k: v for k, v in user.items() if k != "password_hash"}
    return safe

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/refresh")
async def refresh_token_ep(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(401, "No refresh token")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALG])
        if payload.get("type") != "refresh":
            raise HTTPException(401, "Invalid token type")
        access = create_access_token(payload["sub"], "")
        response.set_cookie("access_token", access, httponly=True, secure=IS_PROD, samesite="lax", max_age=7200, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid refresh token")

# ─── Tools endpoints ──────────────────────────────────────────────────────────
@api_router.get("/tools")
async def get_tools(
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_api: Optional[bool] = None,
    has_free: Optional[bool] = None,
    limit: int = 50,
    skip: int = 0
):
    all_tools = tools_table.all()
    filtered = []
    for t in all_tools:
        if category and t.get("category") != category:
            continue
        if search:
            s = search.lower()
            if not (s in t.get("name","").lower() or
                    s in t.get("description","").lower() or
                    any(s in tag.lower() for tag in t.get("tags", []))):
                continue
        if is_api is not None and t.get("is_api") != is_api:
            continue
        if has_free is not None and t.get("pricing", {}).get("free_tier") != has_free:
            continue
        filtered.append(t)

    # Sort by popularity desc
    filtered.sort(key=lambda x: x.get("popularity", 0), reverse=True)
    total = len(filtered)
    page = filtered[skip: skip + limit]
    return {"tools": page, "total": total, "skip": skip, "limit": limit}

@api_router.get("/tools/search")
async def search_tools(q: str):
    all_tools = tools_table.all()
    ql = q.lower()
    results = [t for t in all_tools if
               ql in t.get("name","").lower() or
               ql in t.get("description","").lower() or
               any(ql in tag.lower() for tag in t.get("tags", [])) or
               ql in t.get("provider","").lower()]
    results.sort(key=lambda x: x.get("popularity", 0), reverse=True)
    return results[:20]

@api_router.get("/tools/{slug}")
async def get_tool(slug: str):
    results = tools_table.search(Q.slug == slug)
    if not results:
        raise HTTPException(404, "Tool not found")
    return results[0]

@api_router.get("/categories")
async def get_categories():
    cats = cats_table.all()
    all_tools = tools_table.all()
    for c in cats:
        c["count"] = sum(1 for t in all_tools if t.get("category") == c["name"])
    return cats

# ─── Chat endpoint ────────────────────────────────────────────────────────────
@api_router.post("/chat")
async def chat(data: ChatMsg, current_user: dict = Depends(get_current_user)):
    session_id = data.session_id or str(uuid.uuid4())
    history = chat_table.search((Q.session_id == session_id) & (Q.user_id == current_user["id"]))
    history.sort(key=lambda x: x.get("created_at",""))

    response_text = await call_llm(AI_SYSTEM, history, data.message)
    now = datetime.now(timezone.utc).isoformat()
    chat_table.insert({"session_id": session_id, "user_id": current_user["id"], "role": "user", "content": data.message, "created_at": now})
    chat_table.insert({"session_id": session_id, "user_id": current_user["id"], "role": "assistant", "content": response_text, "created_at": now})
    return {"response": response_text, "session_id": session_id}

@api_router.get("/chat/sessions")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    msgs = chat_table.search(Q.user_id == current_user["id"])
    # Group by session_id
    sessions: dict = {}
    for m in msgs:
        sid = m["session_id"]
        if sid not in sessions:
            sessions[sid] = {"session_id": sid, "messages": []}
        sessions[sid]["messages"].append(m)
    result = []
    for sid, s in sessions.items():
        s["messages"].sort(key=lambda x: x.get("created_at", ""))
        last = s["messages"][-1]
        result.append({
            "session_id": sid,
            "last_message": last["content"][:60] + "..." if len(last["content"]) > 60 else last["content"],
            "message_count": len(s["messages"]),
            "updated_at": last.get("created_at", "")
        })
    result.sort(key=lambda x: x["updated_at"], reverse=True)
    return result[:20]

@api_router.get("/chat/history/{session_id}")
async def get_history(session_id: str, current_user: dict = Depends(get_current_user)):
    msgs = chat_table.search((Q.session_id == session_id) & (Q.user_id == current_user["id"]))
    msgs.sort(key=lambda x: x.get("created_at", ""))
    return msgs

# ─── Recommend endpoint ───────────────────────────────────────────────────────
@api_router.post("/recommend")
async def recommend(data: RecommendReq):
    prompt = f"User requirement: {data.query}"
    if data.budget:
        prompt += f"\nBudget: {data.budget}"
    if data.use_case:
        prompt += f"\nSpecific use case: {data.use_case}"
    prompt += "\n\nRecommend the top 3-5 best AI tools with reasoning. Include pricing, free tier info, and why each is suitable. Format as markdown."
    response = await call_llm(AI_SYSTEM, [], prompt)
    return {"recommendation": response}

# ─── Compare endpoint ─────────────────────────────────────────────────────────
@api_router.post("/compare")
async def compare_tools(data: CompareReq):
    if len(data.tool_slugs) < 2 or len(data.tool_slugs) > 3:
        raise HTTPException(400, "Provide 2-3 tool slugs to compare")
    tools = []
    for slug in data.tool_slugs:
        r = tools_table.search(Q.slug == slug)
        if r:
            tools.append(r[0])
    if len(tools) < 2:
        raise HTTPException(404, "Could not find enough tools")
    return {"tools": tools}

# ─── Save/unsave tools ───────────────────────────────────────────────────────
@api_router.post("/tools/{slug}/save")
async def save_tool(slug: str, current_user: dict = Depends(get_current_user)):
    saved = current_user.get("saved_tools", [])
    if slug not in saved:
        saved.append(slug)
        users_table.update({"saved_tools": saved}, Q.id == current_user["id"])
    return {"saved_tools": saved}

@api_router.delete("/tools/{slug}/save")
async def unsave_tool(slug: str, current_user: dict = Depends(get_current_user)):
    saved = [s for s in current_user.get("saved_tools", []) if s != slug]
    users_table.update({"saved_tools": saved}, Q.id == current_user["id"])
    return {"saved_tools": saved}

@api_router.get("/user/saved-tools")
async def get_saved_tools(current_user: dict = Depends(get_current_user)):
    saved_slugs = current_user.get("saved_tools", [])
    tools = []
    for slug in saved_slugs:
        r = tools_table.search(Q.slug == slug)
        if r:
            tools.append(r[0])
    return tools

# ─── Startup: seed data ──────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@aiuniverse.com")
    admin_pw    = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    if not users_table.search(Q.email == admin_email):
        users_table.insert({
            "id": str(uuid.uuid4()), "name": "Admin", "email": admin_email,
            "password_hash": hash_password(admin_pw), "role": "admin",
            "saved_tools": [], "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info("Admin user seeded")

    # Seed / update tools — insert any that are missing by slug
    existing_slugs = {t.get("slug") for t in tools_table.all()}
    added = 0
    for t in TOOLS_DATA:
        if t["slug"] not in existing_slugs:
            tools_table.insert(t)
            added += 1
    if added:
        logger.info(f"Seeded {added} new tools (total {len(tools_table.all())})")

    # Seed categories if missing
    if not cats_table.all():
        for c in CATEGORIES_DATA:
            cats_table.insert(c)
        logger.info("Categories seeded")

    logger.info(f"AI Universe API ready | LLM provider: {LLM_PROVIDER}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.environ.get("FRONTEND_URL", "http://localhost:5173"),
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

