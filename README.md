# ClipIT - AI Video Clipping Platform

AI-powered platform that automatically creates engaging 60-second clips from videos and podcasts.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js v5
- **AI Services**: AssemblyAI (transcription), OpenAI GPT-4 (highlight detection)
- **Storage**: Cloudflare R2
- **Hosting**: Cloudways

## Features

- Video upload with drag-and-drop
- AI transcription with speaker detection
- Automatic highlight detection and virality scoring
- Auto-captions in multiple styles
- Face tracking and speaker focus
- Export to TikTok, YouTube, Instagram formats

## Getting Started

### Prerequisites

- Node.js 20+ (required for Next.js 16)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-key
ASSEMBLYAI_API_KEY=your-assemblyai-key
CLOUDFLARE_ACCOUNT_ID=your-cf-account
CLOUDFLARE_ACCESS_KEY_ID=your-cf-access-key
CLOUDFLARE_SECRET_ACCESS_KEY=your-cf-secret
CLOUDFLARE_BUCKET=your-bucket-name

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Deployment

**Live URL:** https://clipit.knowitallservices.com/

### Server Details
- **Host:** 45.76.126.112
- **Username:** master_dwerfvteuk
- **Path:** /home/1182486.cloudwaysapps.com/kttmclmqhj/public_html

### Deployment Process (Claude Code)

When deploying changes, Claude should:
1. Push to GitHub: `git push origin main`
2. Deploy to server via rsync (excludes node_modules, .git, .env.local, .nvm, .pm2)
3. SSH to server and run: `npm install && npm run build && pm2 restart clipit`

**Important:** Always deploy to BOTH GitHub and the production server when user approves changes.

### Manual Deployment

```bash
# From project directory, deploy files:
rsync -avz --delete \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude '.env.local' \
  --exclude '.next/cache' \
  --exclude '.pm2' \
  --exclude '.nvm' \
  ./ master_dwerfvteuk@45.76.126.112:/home/1182486.cloudwaysapps.com/kttmclmqhj/public_html/

# SSH to server and rebuild:
ssh master_dwerfvteuk@45.76.126.112
cd /home/1182486.cloudwaysapps.com/kttmclmqhj/public_html
export NVM_DIR="$PWD/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20
export PM2_HOME="$PWD/.pm2"
npm install
npm run build
pm2 restart clipit
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── upload/        # Video upload
│   │   ├── process/       # Video processing
│   │   └── clips/         # Clip management
│   ├── auth/              # Auth pages (signin, signup)
│   ├── dashboard/         # User dashboard
│   └── project/[id]/      # Project view
├── components/            # React components
│   └── ui/               # shadcn/ui components
└── lib/                   # Utilities
    ├── auth.ts           # NextAuth configuration
    ├── openai.ts         # OpenAI integration
    ├── assemblyai.ts     # Transcription service
    └── r2.ts             # Cloudflare R2 storage
```

## License

Proprietary - KnowITAll Services
