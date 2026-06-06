# RoadVision AI

Interactive frontend dashboard for a YOLO-powered traffic sign detection system. Built as a portfolio-ready computer vision demo for road-scene perception and intelligent mobility workflows.

## Features

- Real-time detection interface with upload and sample images
- YOLO-style bounding box overlays with confidence scores
- Detection summary metrics and classified signs table
- Model information, confidence distribution, and inference logs
- API-only inference — no mock or demo fallback when backend is offline
- Direct connection to Hugging Face Space API (no proxy)

## Tech Stack

- React 19 + Vite 8
- Plain CSS (design tokens + dual theme)
- lucide-react icons

## Requirements

- **Node.js 20+** (see `.nvmrc`)

## Getting Started

```bash
npm install
cp .env.example .env   # ajuste a URL do HF Space se necessário
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Base URL do Hugging Face Space (sem `/predict`) |
| `VITE_API_IMAGE_SIZE` | No | Tamanho de inferência YOLO (`416` CPU, `640` GPU). Default: `416` |

```bash
VITE_API_BASE_URL=https://your-space.hf.space
VITE_API_IMAGE_SIZE=416
```

O browser chama a API do HF Space **diretamente** (CORS deve estar habilitado no backend).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Build de produção → `dist/` |
| `npm run preview` | Preview local do build |
| `npm run lint` | ESLint |

---

## Deploy na Vercel

O repositório já inclui `vercel.json` com preset **Vite**, SPA fallback, headers de segurança e cache de assets.

### 1. Importar o projeto

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe este repositório do GitHub
3. A Vercel detecta automaticamente:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Node.js:** 20.x (via `.nvmrc` + `engines`)

Não é necessário alterar as configurações de build — o `vercel.json` já define tudo.

### 2. Variáveis de ambiente

Em **Project Settings → Environment Variables**, adicione:

| Name | Value | Environments |
|------|-------|----------------|
| `VITE_API_BASE_URL` | `https://your-space.hf.space` | Production, Preview |
| `VITE_API_IMAGE_SIZE` | `416` (ou `640` com GPU) | Production, Preview |

> **Importante:** variáveis `VITE_*` são embutidas no bundle no momento do build. Após alterar, faça **Redeploy**.

### 3. CORS no Hugging Face Space

O frontend na Vercel roda em `https://<projeto>.vercel.app`. O backend precisa permitir essa origem.

No Space (FastAPI/Gradio), configure `CORS_ORIGINS` para incluir:

```
https://<seu-projeto>.vercel.app
https://<seu-projeto>-*.vercel.app
```

Ou use `*` em desenvolvimento/demo (não recomendado em produção).

Sem CORS correto, o status da API ficará **offline** e `/predict` falhará com `failed to fetch`.

### 4. Deploy

```bash
# Opção A — Git push (recomendado)
git push origin main

# Opção B — CLI local
npm i -g vercel
vercel          # primeiro deploy (preview)
vercel --prod   # produção
```

### 5. Verificar após deploy

- [ ] Página carrega em `https://<projeto>.vercel.app`
- [ ] Pill **API** fica verde após cold start do HF Space (~30–60 s)
- [ ] Sample image dispara detecção com bounding boxes
- [ ] Upload de imagem funciona
- [ ] Tema dark/light persiste (`localStorage`)

### 6. Domínio customizado (opcional)

**Project Settings → Domains** → adicione seu domínio e atualize `CORS_ORIGINS` no HF Space com a nova URL.

### Troubleshooting Vercel

| Problema | Solução |
|----------|---------|
| API offline em produção, OK em local | CORS — adicione a URL `.vercel.app` no backend |
| Build falha | Confirme Node 20+ na Vercel (Settings → General) |
| Variável não aplicada | Redeploy após salvar env vars |
| Inferência muito lenta | HF Space em CPU — use `VITE_API_IMAGE_SIZE=416` ou ative GPU |
| 404 ao recarregar página | `vercel.json` já inclui rewrite SPA para `index.html` |

---

## API Endpoints (backend esperado)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (`status: ready`) |
| `/model/info` | GET | Model metadata |
| `/classes` | GET | Class names list |
| `/predict` | POST | Image prediction (multipart `file`) |

## Project Structure

```
├── public/samples/     # Imagens de amostra (servidas como estáticos)
├── src/
│   ├── components/     # UI do dashboard
│   ├── services/api.js # Cliente HTTP (HF Space)
│   ├── styles/         # Tokens, tema, CSS global
│   └── utils/          # Mapeamento YOLO, imagem, etc.
├── vercel.json         # Config de deploy
├── .env.example        # Template de variáveis
└── .nvmrc              # Node 20
```

## License

MIT — see [LICENSE](LICENSE).
