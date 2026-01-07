# ✅ NextBoard Setup Checklist

Use this checklist to ensure your NextBoard installation is complete and ready to deploy.

---

## 📋 Pre-Installation

- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] PostgreSQL installed (local) OR Railway account created
- [ ] OpenAI API key obtained ([Get one](https://platform.openai.com/api-keys))
- [ ] Git installed

---

## 🔧 Installation Steps

### 1. Clone & Install
- [ ] Repository cloned
- [ ] `npm install` completed successfully
- [ ] All dependencies installed without errors

### 2. Environment Configuration
- [ ] `.env` file created (from `.env.example`)
- [ ] `DATABASE_URL` configured
- [ ] `OPENAI_API_KEY` added to `.env`
- [ ] No extra spaces or quotes in `.env` values

### 3. Database Setup
- [ ] PostgreSQL database created (if local)
- [ ] `npx prisma generate` executed
- [ ] `npx prisma migrate dev` completed (local) or `npx prisma migrate deploy` (Railway)
- [ ] Database tables created successfully
- [ ] Can connect to database without errors

### 4. Development Server
- [ ] `npm run dev` starts without errors
- [ ] Can access http://localhost:3000
- [ ] No console errors in browser
- [ ] Upload form displays correctly

---

## 🧪 Functionality Testing

### Upload & Processing
- [ ] Can select/drag files into upload zone
- [ ] Supported file formats: `.txt`, `.mp3`, `.mp4`, `.wav`, `.vtt`, `.docx`
- [ ] Can enter meeting title and participants
- [ ] "Generate Board" button works
- [ ] AI processing completes successfully
- [ ] Meeting board displays with cards

### Board View
- [ ] Kanban board shows 3 columns (Pending, In Progress, Done)
- [ ] Cards display correctly with type, summary, owner
- [ ] Can drag cards between columns
- [ ] Card status updates in real-time
- [ ] "Back" button returns to upload view
- [ ] "Export as Markdown" downloads file

### Navigation
- [ ] "New Board" button works
- [ ] "My Boards" shows all meetings
- [ ] Can click meeting card to view board
- [ ] All navigation is smooth and responsive

---

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] All imports resolved

### Security
- [ ] `.env` is in `.gitignore`
- [ ] No API keys committed to Git
- [ ] Database credentials not exposed
- [ ] File upload size limits configured

### Performance
- [ ] Images/assets optimized
- [ ] Large files excluded from Git
- [ ] Database queries efficient
- [ ] API responses fast

---

## 🚂 Railway Deployment

### Railway Setup
- [ ] Railway account created
- [ ] New project created
- [ ] GitHub repository connected
- [ ] PostgreSQL database added
- [ ] `DATABASE_URL` auto-configured

### Environment Variables
- [ ] `OPENAI_API_KEY` added to Railway
- [ ] All required env vars set
- [ ] Variables saved and deployed

### Build & Deploy
- [ ] Railway build succeeds
- [ ] Migrations run successfully
- [ ] App deployed without errors
- [ ] Can access Railway URL
- [ ] Test upload/process on production

### Post-Deploy Testing
- [ ] Upload transcript on production
- [ ] AI processing works on production
- [ ] Drag-and-drop works
- [ ] Export functionality works
- [ ] No console errors on production

---

## 📱 Optional Features

### Custom Domain
- [ ] Domain purchased
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Domain accessible

### Monitoring
- [ ] Railway logs reviewed
- [ ] Error tracking setup (e.g., Sentry)
- [ ] Uptime monitoring configured

### Enhancements
- [ ] Custom favicon added
- [ ] Meta tags for SEO
- [ ] Analytics added (e.g., Google Analytics)
- [ ] Authentication implemented (optional)

---

## 🐛 Troubleshooting Checklist

If something doesn't work, check:

- [ ] `.env` file exists and has correct values
- [ ] Database is running and accessible
- [ ] OpenAI API key is valid and has credits
- [ ] Port 3000 is not in use
- [ ] Node modules installed (`node_modules` exists)
- [ ] Prisma client generated
- [ ] No firewall blocking connections
- [ ] Railway build logs for errors

---

## 📊 Success Metrics

Your NextBoard is ready when:

- ✅ Can upload transcript without errors
- ✅ AI extracts 3+ action items correctly
- ✅ Can drag cards between columns smoothly
- ✅ Export downloads valid Markdown file
- ✅ App loads in <3 seconds
- ✅ No console errors or warnings
- ✅ Mobile responsive (test on phone)

---

## 🎉 You're Done!

Once all items are checked, your NextBoard is ready for production use!

**Next Steps**:
1. Share with team for feedback
2. Create your first real meeting board
3. Monitor usage and performance
4. Plan phase 2 features

---

**Questions?** Check [README.md](./README.md) or [QUICK_START.md](./QUICK_START.md)







