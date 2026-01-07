# 🧱 NextBoard

**Where meetings become actions.**

Transform meeting recordings and transcripts into structured, AI-generated action boards — eliminating PowerPoint summaries and manual follow-ups.

![NextBoard](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-green)

---

## 🎯 What is NextBoard?

NextBoard is a full-stack web application that uses AI to automatically extract:
- ✅ **Actions** - Tasks that need to be done
- 📊 **Decisions** - Conclusions or agreements reached
- 🔄 **Follow-ups** - Items needing further discussion
- 📢 **Updates** - Status updates or information shared

...from your meeting transcripts and recordings, organizing them into a beautiful, drag-and-drop Kanban board.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **PostgreSQL** database (or Railway account)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd next-board.io

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY, Clerk keys, Resend API key, and DATABASE_URL

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 🗂️ Project Structure

```
/src
  /app
    /api
      /upload          # File upload endpoint
      /process         # AI processing endpoint
      /board/[id]      # Get specific board
      /boards          # List all boards
      /card/[id]       # Update/delete cards
    layout.tsx         # Root layout
    page.tsx           # Main page
    globals.css        # Global styles
  /components
    UploadPanel.tsx    # File upload UI
    BoardView.tsx      # Kanban board with drag-drop
    CardItem.tsx       # Individual card component
  /lib
    api.ts             # API utilities
    prisma.ts          # Prisma client
    openai.ts          # OpenAI configuration
    utils.ts           # Helper functions
  /store
    meetings.ts        # Zustand state management
  /types
    meeting.ts         # TypeScript types
/prisma
  schema.prisma        # Database schema
  /migrations          # Database migrations
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Next.js 14 + TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | Zustand |
| **Drag & Drop** | @dnd-kit |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (via Prisma ORM) |
| **AI** | OpenAI GPT-4o-mini |
| **Deployment** | Railway |

---

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload transcript/recording file |
| `POST` | `/api/process` | Parse transcript with AI → JSON |
| `GET` | `/api/board/:id` | Retrieve specific meeting board |
| `GET` | `/api/boards` | List all meeting boards |
| `PUT` | `/api/card/:id` | Update card status/details |
| `DELETE` | `/api/card/:id` | Delete a card |

### Example: Upload & Process

```bash
# 1. Upload file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@transcript.txt" \
  -F "title=Weekly Sync" \
  -F "participants=Alex, Sarah, Mike"

# Response: { "success": true, "file": {...} }

# 2. Process transcript
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "filepath": "/uploads/...",
    "title": "Weekly Sync",
    "participants": "Alex, Sarah, Mike"
  }'

# Response: { "success": true, "meeting": {...} }
```

---

## 🧠 AI Processing

NextBoard uses OpenAI's GPT-4o-mini with structured JSON output:

```typescript
{
  "meeting_title": "Weekly Sync",
  "summary": "Team discussed Q4 priorities...",
  "cards": [
    {
      "type": "Action",
      "summary": "Prepare Q4 forecast",
      "owner": "Alex",
      "due_date": "Friday",
      "context": "Assigned during financial review",
      "timestamp": "00:12:30"
    }
  ]
}
```

The AI prompt is optimized to extract actionable items with high accuracy.

---

## 🎨 Features

### ✅ Core Features (MVP)

- [x] Upload meeting transcripts (`.txt`, `.vtt`, `.docx`)
- [x] Upload recordings (`.mp3`, `.mp4`, `.wav`)
- [x] AI-powered extraction of actions, decisions, follow-ups, updates
- [x] Beautiful Kanban board with 3 columns: Pending, In Progress, Done
- [x] Drag-and-drop cards between columns
- [x] Real-time status updates
- [x] Export board as Markdown
- [x] View all meeting boards
- [x] Responsive design

### 🚧 Phase 2 Ideas

- [ ] Meeting comparison view
- [ ] Slack notifications for overdue items
- [ ] AI-driven agenda suggestions
- [ ] Multi-user workspaces
- [ ] PDF export
- [ ] Audio/video transcription (Whisper API)

---

## 🚂 Deployment to Railway

### Step-by-Step Guide

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select your repository
   - Add **PostgreSQL** database: **"+ New"** → **"Database"** → **"PostgreSQL"**

3. **Set Environment Variables**
   In Railway project settings → **Variables**:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```
   (DATABASE_URL is auto-provided by Railway)

4. **Deploy!**
   Railway automatically builds and deploys your app.

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed instructions.

---

## 🧪 Development Commands

```bash
# Development
npm run dev           # Start dev server

# Database
npm run migrate       # Run migrations (dev)
npm run migrate:deploy # Run migrations (production)
npm run db:push       # Push schema changes
npm run db:studio     # Open Prisma Studio

# Build & Deploy
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
```

---

## 📝 Environment Variables

Create a `.env` file in the root:

```env
# Database (Railway provides this automatically)
DATABASE_URL="postgresql://user:password@host:port/database"

# Anthropic Claude API Key (required for AI processing)
ANTHROPIC_API_KEY="sk-ant-your-actual-key-here"

# Clerk Authentication (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_ZnVsbC1iZWUtNzIuY2xlcmsuYWNjb3VudHMuZGV2JA"
CLERK_SECRET_KEY="sk_test_h3WbKiz4bTLY05A6KQ1Nk9UoydZtgJHBKcaHLqLUsP"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Resend Email (required for email notifications)
RESEND_API_KEY="re_ddD5TTv4_Nqxejwr28DUzSYTdfmr3pxks"
RESEND_FROM_EMAIL="onboarding@resend.dev"
RESEND_FROM_NAME="NextBoard"

# Cron Jobs (required for scheduled email notifications)
CRON_SECRET="cron-secret-531195-763483"

# Environment
NODE_ENV="production"

# Optional: AWS S3 for file storage
# AWS_ACCESS_KEY_ID=""
# AWS_SECRET_ACCESS_KEY=""
# AWS_REGION=""
# AWS_S3_BUCKET=""
```

---

## 🗄️ Database Schema

```prisma
model Meeting {
  id        String        @id @default(cuid())
  title     String
  summary   String
  createdAt DateTime      @default(now())
  cards     MeetingCard[]
}

model MeetingCard {
  id         String   @id @default(cuid())
  meetingId  String
  type       String   // Action, Decision, Follow-up, Update
  summary    String
  owner      String?
  dueDate    String?
  timestamp  String?
  context    String?
  status     String   @default("Pending")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  meeting    Meeting  @relation(fields: [meetingId], references: [id], onDelete: Cascade)
}
```

---

## 🎨 UI Features

- **Modern Design**: Clean, minimal interface with Tailwind CSS
- **Drag & Drop**: Smooth card movement using @dnd-kit
- **Responsive**: Works beautifully on desktop, tablet, and mobile
- **Dark Mode Ready**: Easy to extend with dark mode support
- **Accessible**: Semantic HTML and ARIA labels

---

## 🐛 Troubleshooting

### "Failed to upload file"
- Check file size (max 50MB)
- Verify file format is supported

### "Failed to process transcript"
- Ensure OPENAI_API_KEY is set correctly
- Check OpenAI API quota/billing
- Verify transcript has actual content (not empty)

### Database connection errors
- Verify DATABASE_URL is correct
- Run `npx prisma migrate deploy`
- Check PostgreSQL is running (local) or Railway database is active

### Drag-and-drop not working
- Clear browser cache
- Check console for JavaScript errors
- Ensure React version is compatible

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o-mini
- **Vercel** for Next.js
- **Railway** for seamless deployment
- **@dnd-kit** for drag-and-drop functionality

---

## 📞 Support

- **Website**: [next-board.ai](https://next-board.ai)
- **Backup**: [next-board.io](https://next-board.io)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)

---

**Built with ❤️ using Next.js, TypeScript, and OpenAI**


