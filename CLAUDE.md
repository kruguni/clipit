# ClipIT - AI Video Clipping Platform

## Project Overview
ClipIT is an AI-powered video clipping platform that automatically creates engaging 60-second clips from long-form videos and podcasts. Similar to Opus Clip, Clippity, and Vizard.

**Owner**: Know IT All Services (knowitallservices.com)
**Domain**: clips.knowitallservices.com (subdomain on Cloudways)
**Repository**: https://github.com/kruguni/clipit

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui components |
| Auth | NextAuth.js v5 (beta) with Google, Facebook, Email |
| Database | PostgreSQL with Prisma ORM (schema ready, not connected yet) |
| Storage | Cloudflare R2 (S3-compatible) |
| AI - Transcription | AssemblyAI (word-level timestamps, speaker diarization) |
| AI - Highlights | OpenAI GPT-4 (clip detection, virality scoring) |
| Hosting | Cloudways (Custom App with Lightning Stack) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page with upload
│   ├── dashboard/            # User's projects list
│   ├── project/[id]/         # Project detail with clips
│   ├── settings/             # API key configuration UI
│   ├── auth/
│   │   ├── signin/           # Sign in page
│   │   └── signup/           # Registration page
│   └── api/
│       ├── auth/             # NextAuth handlers
│       ├── upload/           # Video upload (presigned URLs)
│       ├── process/          # Start/check transcription
│       ├── clips/            # Clip CRUD + download
│       ├── settings/         # Save/test API keys
│       └── webhooks/         # AssemblyAI callbacks
├── components/
│   ├── ui/                   # shadcn components
│   ├── providers.tsx         # Session provider
│   └── user-menu.tsx         # Auth dropdown
├── lib/
│   ├── ai/
│   │   ├── openai.ts         # GPT-4 highlight detection
│   │   └── assemblyai.ts     # Transcription service
│   ├── storage/
│   │   └── r2.ts             # Cloudflare R2 operations
│   ├── auth.ts               # NextAuth config
│   ├── config.ts             # Load API keys
│   ├── db.ts                 # Prisma client (placeholder)
│   └── utils.ts              # Tailwind utilities
├── types/
│   └── index.ts              # TypeScript interfaces
└── prisma/
    └── schema.prisma         # Database schema
```

---

## Features Implemented

### Completed
- [x] Landing page with drag-drop video upload UI
- [x] Dashboard with project cards and stats
- [x] Project detail page with clip viewer
- [x] Settings page for API key management
- [x] User authentication (Google, Facebook, Email)
- [x] API routes for upload, process, clips
- [x] OpenAI integration for highlight detection
- [x] AssemblyAI integration for transcription
- [x] Cloudflare R2 integration for storage
- [x] Presigned URL generation for uploads

### In Progress / Next Steps
- [ ] Connect frontend to real backend APIs (currently mock data)
- [ ] Set up PostgreSQL database
- [ ] Video rendering with FFmpeg (clip extraction)
- [ ] Caption rendering on clips
- [ ] Face tracking/cropping for vertical video
- [ ] Deploy to Cloudways

---

## API Keys & Services

All credentials stored in `.env.local` (gitignored).

| Service | Status | Purpose |
|---------|--------|---------|
| OpenAI | Connected | Highlight detection, virality scoring |
| AssemblyAI | Connected | Video transcription |
| Cloudflare R2 | Connected | Video/clip storage |
| Google OAuth | Not configured | Social login |
| Facebook OAuth | Not configured | Social login |
| PostgreSQL | Not configured | User/project data |

---

## Cloudways Server Access

- **Host:** 45.76.126.112
- **User:** master_dwerfvteuk
- **Password:** bj8DeZUIkGL%u#
- **SSH Config:** `ssh cloudways-knowitall` (then enter password)
- **App Name**: Clips.KnowITAllServices.com
- **Folder**: `kttmclmqhj` under applications
- **Stack**: Lightning Stack (Nginx)
- **Temp Domain**: phpstack-1182486-6299706.cloudwaysapps.com

```bash
# Quick SSH access
sshpass -p 'bj8DeZUIkGL%u#' ssh -o StrictHostKeyChecking=no master_dwerfvteuk@45.76.126.112
```

### Deployment Steps (when ready):
1. SSH into Cloudways server
2. Install Node.js via NVM (`nvm install 20`)
3. Clone repo to public_html
4. `npm install && npm run build`
5. Run with PM2: `pm2 start npm --name clipit -- start`
6. Configure nginx to proxy port 3000

---

## Database Schema Summary

**User** - accounts, sessions, projects
**Project** - video info, transcription, status
**Clip** - extracted clips with scores
**Account/Session** - NextAuth tables

See `prisma/schema.prisma` for full schema.

---

## Key Commands

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Database (when connected)
npx prisma generate
npx prisma db push
npx prisma studio
```

---

## Processing Pipeline

```
1. Upload → Presigned URL → R2 Storage
2. Process → AssemblyAI transcription (async)
3. Webhook → Receive transcript
4. Analyze → GPT-4 finds highlights
5. Render → FFmpeg extracts clips (TODO)
6. Deliver → Clips stored in R2
```

---

## Notes for Future Sessions

1. **Frontend uses mock data** - The dashboard and project pages show hardcoded mock projects. Need to connect to real API endpoints.

2. **Database not connected** - Prisma schema is ready but no DATABASE_URL configured. User data is not persisted yet.

3. **Video rendering not implemented** - FFmpeg integration needed for actual clip extraction and caption rendering.

4. **Social OAuth needs setup** - Google/Facebook client IDs not configured yet.

5. **Bucket name** - `clipit-knowitallservices` (not `clipit-videos`)

---

## Contact

Project Owner: Jaco (kruguni on GitHub)
Main Site: knowitallservices.com
