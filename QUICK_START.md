# ⚡ Quick Start Guide

Get NextBoard running in **5 minutes**!

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Set Up Environment Variables

Create a `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nextboard"
OPENAI_API_KEY="sk-your-actual-key-here"
```

> **Get an OpenAI API key**: https://platform.openai.com/api-keys

## 3️⃣ Set Up Database

### Option A: Local PostgreSQL

Make sure PostgreSQL is running, then:

```bash
# Create database
createdb nextboard

# Run migrations
npx prisma migrate dev
```

### Option B: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy the `DATABASE_URL` from Railway to your `.env`
5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## 4️⃣ Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3005](http://localhost:3005) 🎉

## 5️⃣ Try It Out!

1. **Upload a transcript**: Use the provided `sample-transcript.txt` file
2. **Add meeting details**: Give it a title like "Weekly Sync"
3. **Click "Generate Board"**: Watch AI extract action items
4. **Drag cards**: Move items between Pending, In Progress, and Done
5. **Export**: Download your board as Markdown

---

## 🔧 Troubleshooting

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Can't connect to database"
- Check your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Try: `npx prisma db push`

### "OpenAI API error"
- Verify your `OPENAI_API_KEY` is correct
- Check you have credits: https://platform.openai.com/usage
- Ensure no extra spaces in `.env` file

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

---

## 📚 Next Steps

- Read the full [README.md](./README.md)
- Deploy to Railway: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- Customize the AI prompt in `src/lib/openai.ts`
- Add authentication with NextAuth or Clerk

---

**Need help?** Open an issue on GitHub or check the documentation.

