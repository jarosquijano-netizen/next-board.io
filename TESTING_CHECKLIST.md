# NextBoard.ai - Testing Checklist

## 🎯 Date: October 17, 2025
## Status: Ready for Testing

---

## ✅ Manual Testing Checklist

### 1. Authentication & User Management
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Sign out functionality
- [ ] Session persistence (refresh page while logged in)
- [ ] Unauthorized access prevention (direct URL navigation)

### 2. Board Management
- [ ] Create new board
- [ ] View all boards on `/boards` page
- [ ] Navigate to specific board
- [ ] Delete board (with confirmation)
- [ ] Board metadata displays correctly (title, date, item count)

### 3. File Upload & Processing
- [ ] Upload TXT file with meeting transcript
- [ ] Upload PDF file with meeting transcript
- [ ] File validation (only TXT/PDF allowed)
- [ ] AI processing of transcript (Claude API)
- [ ] Demo mode works without API key
- [ ] Error handling for invalid files
- [ ] Success feedback after upload

### 4. Card Management
- [ ] Cards display with correct information
- [ ] Card type badges show correctly (8 types: Action, Decision, Follow-up, Update, Blocker, Idea, Risk, Question)
- [ ] Priority badges display (urgent, high, medium, low)
- [ ] Due date formatting (Today, Tomorrow, specific dates)
- [ ] Time estimates display correctly
- [ ] Urgency indicators (overdue, urgent, soon)
- [ ] Click card to open detail modal
- [ ] Edit card inline (title, owner, due date)
- [ ] Delete card (with confirmation)
- [ ] Drag and drop cards between columns

### 5. Kanban Board (4 Columns)
- [ ] To Do column displays correctly
- [ ] In Progress column displays correctly
- [ ] Blocked column displays correctly
- [ ] Done column displays correctly
- [ ] Column taglines show ("Procrastination station", etc.)
- [ ] Column icons render (SF Symbol style)
- [ ] Column counts update correctly
- [ ] Empty states display when no cards
- [ ] Cards persist status changes

### 6. View Modes (4 Views)
- [ ] **Kanban Board** (K shortcut)
  - [ ] All 4 columns visible
  - [ ] Drag and drop works
  - [ ] Cards sorted correctly
- [ ] **Calendar View** (C shortcut)
  - [ ] Month navigation works
  - [ ] Cards show on correct dates
  - [ ] Today indicator visible
  - [ ] Click card to view details
- [ ] **My Focus Today** (F shortcut)
  - [ ] Overdue section displays
  - [ ] Due Today section displays
  - [ ] Blocked section displays
  - [ ] In Progress section displays
  - [ ] Due Tomorrow section (collapsible)
  - [ ] High Priority No Date section (collapsible)
  - [ ] Empty state when no items
  - [ ] Focus count shows correctly
- [ ] **Priority Matrix** (M shortcut)
  - [ ] Do First quadrant (Urgent + Important)
  - [ ] Schedule quadrant (Important, Not Urgent)
  - [ ] Delegate quadrant (Urgent, Less Important)
  - [ ] Eliminate quadrant (Not Urgent, Not Important)
  - [ ] Cards auto-categorize correctly
  - [ ] Legend shows classification rules

### 7. Time Tracking Widgets (8 Widgets in 1 Row)
- [ ] **Stale Items** - counts cards stuck 3+ days
- [ ] **Auto-Escalated** - counts auto-escalated priority cards
- [ ] **Avg Time** - shows average time in current status
- [ ] **Total Time** - shows total work time
- [ ] **Overdue** - counts overdue tasks
- [ ] **Due Soon** - counts urgent tasks
- [ ] **This Week** - counts upcoming tasks
- [ ] **Done Today** - counts completed tasks today
- [ ] All 8 widgets fit in 1 row
- [ ] "Hide Overview" button collapses/expands all widgets
- [ ] Widget counts update in real-time

### 8. Card Detail Modal
- [ ] Modal opens on card click
- [ ] Shows full card details
- [ ] Activity log displays
- [ ] Add note functionality
- [ ] File attachments (if implemented)
- [ ] AI summary generation (for done cards)
- [ ] Edit card fields
- [ ] Delete card from modal
- [ ] Close modal (X button, ESC key, backdrop click)

### 9. Search & Filter
- [ ] Search bar filters by summary
- [ ] Search filters by owner
- [ ] Search filters by context
- [ ] Filter by card type (all 8 types)
- [ ] Multiple filters work together
- [ ] Clear search functionality

### 10. Theme & UI
- [ ] **Light Mode**
  - [ ] Logo displays correctly (dark logo)
  - [ ] Text contrast is readable
  - [ ] Widgets have proper colors
  - [ ] Cards are visible
  - [ ] Buttons are styled correctly
- [ ] **Dark Mode**
  - [ ] Logo displays correctly (light logo)
  - [ ] All elements visible
  - [ ] Proper contrast
- [ ] Theme toggle works
- [ ] Theme persists after refresh
- [ ] No flash of wrong theme on load

### 11. Keyboard Shortcuts
- [ ] Ctrl/Cmd + K → Kanban Board
- [ ] Ctrl/Cmd + C → Calendar View
- [ ] Ctrl/Cmd + F → My Focus Today
- [ ] Ctrl/Cmd + M → Priority Matrix
- [ ] ESC → Close modal

### 12. Export Functionality
- [ ] Export as Markdown works
- [ ] File downloads correctly
- [ ] Markdown format is valid
- [ ] All sections included
- [ ] Filename is clean

### 13. Responsive Design
- [ ] Desktop view (1920px+)
- [ ] Laptop view (1366px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)
- [ ] Sidebar collapses on mobile
- [ ] Widgets stack on small screens

### 14. Error Handling
- [ ] Invalid file upload shows error
- [ ] API errors display user-friendly messages
- [ ] Network errors handled gracefully
- [ ] Loading states show correctly
- [ ] Failed AI processing shows error

### 15. Performance
- [ ] Page loads in < 3 seconds
- [ ] Card drag/drop is smooth
- [ ] No lag when filtering
- [ ] Large boards (50+ cards) perform well
- [ ] Images/logos load quickly

---

## 🐛 Known Issues

### Fixed:
- ✅ Logo theme switching now works correctly
- ✅ Widgets now fit in 1 row
- ✅ Date picker displays properly
- ✅ PDF upload and text extraction working
- ✅ Drag-and-drop fixed with DroppableColumn

### To Monitor:
- ⚠️ Auto-priority escalation (cron job not set up yet)
- ⚠️ File attachments not fully implemented
- ⚠️ AI summary generation for done cards

---

## 🔒 Security Testing

- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF protection (Next.js handles this)
- [ ] Authentication required for all routes
- [ ] Users can only access their own data
- [ ] File upload size limits enforced
- [ ] File type validation on server-side

---

## 🚀 Deployment Testing (Railway)

- [ ] Environment variables set correctly
- [ ] Database connection works
- [ ] Prisma migrations run successfully
- [ ] Claude API key configured
- [ ] Clerk API keys configured
- [ ] Build completes without errors
- [ ] Production site loads
- [ ] All features work in production

---

## 📊 Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 🎯 Critical Path Test (Must Pass)

1. ✅ User can sign in
2. ✅ User can create a new board
3. ✅ User can upload a transcript (TXT or PDF)
4. ✅ AI processes transcript and creates cards
5. ✅ User can view cards in Kanban board
6. ✅ User can drag cards between columns
7. ✅ User can click card to see details
8. ✅ User can edit card information
9. ✅ User can switch between views
10. ✅ User can export board as Markdown

---

## 📝 Test Results

**Tested By:** _________________  
**Date:** _________________  
**Environment:** ☐ Local ☐ Railway Production  
**Overall Status:** ☐ Pass ☐ Fail ☐ Partial  

**Notes:**
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

## 🔄 Automated Testing (Recommended for Future)

### Unit Tests to Create:
- `time-utils.ts` - time calculations
- `time-tracker.ts` - status tracking
- `anthropic.ts` - AI prompt generation
- `Logo.tsx` - theme switching logic

### Integration Tests to Create:
- API routes (`/api/upload`, `/api/process`, `/api/board/[id]`)
- File upload flow
- Card CRUD operations
- Status change tracking

### E2E Tests to Create (Playwright):
- Complete user flow (sign in → upload → view → edit → export)
- Drag and drop functionality
- Modal interactions
- View switching

---

## 📈 Performance Benchmarks

- Time to first byte: _______
- Largest contentful paint: _______
- Time to interactive: _______
- Total bundle size: _______
- API response time: _______

---

## ✅ Final Checklist Before Production

- [ ] All critical path tests pass
- [ ] No console errors in browser
- [ ] No linter errors
- [ ] All environment variables documented
- [ ] README updated with setup instructions
- [ ] Database migrations tested
- [ ] Error monitoring set up (optional)
- [ ] Backup strategy in place
- [ ] Domain connected (next-board.io)
- [ ] SSL certificate active
- [ ] User acceptance testing completed

---

**Last Updated:** October 17, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Testing







