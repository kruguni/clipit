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

- Node.js 18+
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

## Deployment (Cloudways)

1. Build locally: `npm run build`
2. Upload files via SFTP or rsync
3. Restart the Node.js process

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
