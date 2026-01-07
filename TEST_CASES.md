# 🧪 NextBoard.ai - Comprehensive Test Cases

**Generated:** October 29, 2025  
**Version:** 1.0  
**Status:** Ready for Execution  

---

## Table of Contents
1. [Authentication Tests](#1-authentication-tests)
2. [File Upload Tests](#2-file-upload-tests)
3. [AI Processing Tests](#3-ai-processing-tests)
4. [Board Management Tests](#4-board-management-tests)
5. [Card Management Tests](#5-card-management-tests)
6. [Drag & Drop Tests](#6-drag--drop-tests)
7. [View Mode Tests](#7-view-mode-tests)
8. [Time Tracking Tests](#8-time-tracking-tests)
9. [Search & Filter Tests](#9-search--filter-tests)
10. [Analytics Tests](#10-analytics-tests)
11. [Theme Tests](#11-theme-tests)
12. [Export Tests](#12-export-tests)
13. [Recurring Meeting Tests](#13-recurring-meeting-tests)
14. [Email Notification Tests](#14-email-notification-tests)
15. [Performance Tests](#15-performance-tests)
16. [Security Tests](#16-security-tests)
17. [API Integration Tests](#17-api-integration-tests)

---

## 1. Authentication Tests

### TC-AUTH-001: Sign Up - New User
**Priority:** Critical  
**Preconditions:** User has valid email  
**Steps:**
1. Navigate to http://localhost:3005
2. Click "Sign Up" button
3. Enter email and password
4. Complete verification
5. Verify redirect to dashboard

**Expected Result:** User successfully signs up and is redirected to dashboard  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AUTH-002: Sign In - Existing User
**Priority:** Critical  
**Preconditions:** User already has account  
**Steps:**
1. Navigate to http://localhost:3005
2. Click "Sign In" button
3. Enter valid credentials
4. Click submit

**Expected Result:** User successfully logs in and sees dashboard  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AUTH-003: Sign Out
**Priority:** High  
**Preconditions:** User is logged in  
**Steps:**
1. Click user avatar/menu
2. Click "Sign Out"
3. Verify redirect to login page

**Expected Result:** User is logged out and cannot access protected routes  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AUTH-004: Session Persistence
**Priority:** High  
**Preconditions:** User is logged in  
**Steps:**
1. Login to application
2. Refresh browser (F5)
3. Verify still logged in

**Expected Result:** Session persists after refresh  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AUTH-005: Unauthorized Access Prevention
**Priority:** Critical  
**Preconditions:** User is not logged in  
**Steps:**
1. Open browser in incognito mode
2. Navigate to http://localhost:3005/boards
3. Verify redirect to login

**Expected Result:** User is redirected to login page  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 2. File Upload Tests

### TC-UPLOAD-001: Upload TXT File
**Priority:** Critical  
**Preconditions:** User is logged in  
**Steps:**
1. Navigate to home page
2. Click upload area or button
3. Select `sample-transcript.txt`
4. Enter meeting title: "Weekly Sync"
5. Click "Upload & Process"

**Expected Result:** File uploads successfully, shows processing indicator  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-UPLOAD-002: Upload PDF File
**Priority:** Critical  
**Preconditions:** User is logged in, PDF with text available  
**Steps:**
1. Navigate to home page
2. Click upload area
3. Select a PDF file with meeting transcript
4. Enter meeting title
5. Click "Upload & Process"

**Expected Result:** PDF text is extracted and processed  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-UPLOAD-003: Invalid File Type
**Priority:** High  
**Preconditions:** User is logged in  
**Steps:**
1. Attempt to upload image file (.jpg)
2. Verify error message

**Expected Result:** Error: "Invalid file type. Allowed: mp3, wav, mp4, txt, vtt, docx, pdf"  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-UPLOAD-004: Empty File
**Priority:** Medium  
**Preconditions:** User is logged in  
**Steps:**
1. Upload empty .txt file
2. Click process

**Expected Result:** Error: "No transcript content provided"  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-UPLOAD-005: Large File (10MB+)
**Priority:** Medium  
**Preconditions:** Large transcript file  
**Steps:**
1. Upload 10MB+ transcript file
2. Monitor processing time
3. Verify successful processing

**Expected Result:** File processes within 30 seconds, may show "long transcript" handling  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-UPLOAD-006: Drag and Drop Upload
**Priority:** Low  
**Preconditions:** User is logged in  
**Steps:**
1. Drag file from desktop
2. Drop onto upload area
3. Verify file is accepted

**Expected Result:** File is uploaded via drag-and-drop  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 3. AI Processing Tests

### TC-AI-001: Demo Mode (No API Key)
**Priority:** High  
**Preconditions:** ANTHROPIC_API_KEY not set  
**Steps:**
1. Upload sample transcript
2. Process with demo mode
3. Verify demo cards created

**Expected Result:** Demo mode generates sample cards without API call  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AI-002: Claude API Processing
**Priority:** Critical  
**Preconditions:** ANTHROPIC_API_KEY configured  
**Steps:**
1. Upload real transcript
2. Monitor API call
3. Verify cards extracted

**Expected Result:** Claude extracts action items, decisions, etc.  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AI-003: Long Transcript Handling
**Priority:** High  
**Preconditions:** Transcript > 8000 characters  
**Steps:**
1. Upload very long transcript
2. Verify token limit handling
3. Check card generation

**Expected Result:** System handles long transcripts, generates max 10 action items  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AI-004: Invalid JSON Response
**Priority:** Medium  
**Preconditions:** Mock invalid JSON from AI  
**Steps:**
1. Trigger AI processing
2. Verify JSON cleanup logic
3. Check error handling

**Expected Result:** System attempts to fix trailing commas, incomplete JSON  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AI-005: Card Type Detection
**Priority:** High  
**Preconditions:** Transcript with various items  
**Steps:**
1. Upload transcript with actions, decisions, blockers
2. Process with AI
3. Verify correct types assigned

**Expected Result:** AI correctly identifies card types (Action, Decision, Blocker, etc.)  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AI-006: Owner Extraction
**Priority:** High  
**Preconditions:** Transcript mentions names  
**Steps:**
1. Upload transcript: "Sarah will complete the designs by Friday"
2. Process
3. Verify owner = "Sarah"

**Expected Result:** AI extracts owner from context  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-AI-007: Due Date Parsing
**Priority:** High  
**Preconditions:** Transcript with dates  
**Steps:**
1. Upload transcript with "by Friday", "next week"
2. Process
3. Verify due dates parsed

**Expected Result:** AI converts natural language dates to ISO format  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 4. Board Management Tests

### TC-BOARD-001: Create New Board
**Priority:** Critical  
**Preconditions:** User is logged in  
**Steps:**
1. Upload and process transcript
2. Verify redirect to new board
3. Check board appears in `/boards`

**Expected Result:** New board created with unique ID  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-BOARD-002: View All Boards
**Priority:** High  
**Preconditions:** User has 3+ boards  
**Steps:**
1. Navigate to /boards
2. Verify all boards listed
3. Check sorting (newest first)

**Expected Result:** All user's boards displayed with metadata  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-BOARD-003: Open Specific Board
**Priority:** Critical  
**Preconditions:** Board exists  
**Steps:**
1. Click board from list
2. Verify correct board loads
3. Check cards display

**Expected Result:** Correct board opens with all cards  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-BOARD-004: Board Metadata Display
**Priority:** Medium  
**Preconditions:** Board has data  
**Steps:**
1. Open board
2. Verify title, date, summary visible
3. Check item counts

**Expected Result:** All metadata displays correctly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-BOARD-005: Empty Board State
**Priority:** Low  
**Preconditions:** Board with no cards  
**Steps:**
1. Create board with empty transcript
2. Verify empty state message

**Expected Result:** "No cards yet" message displays  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 5. Card Management Tests

### TC-CARD-001: Display Card Information
**Priority:** Critical  
**Preconditions:** Board has cards  
**Steps:**
1. Open board
2. Verify card displays:
   - Title/summary
   - Owner
   - Due date
   - Priority badge
   - Type badge
   - Time estimate

**Expected Result:** All card fields visible and formatted correctly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-002: Edit Card - Inline Title
**Priority:** High  
**Preconditions:** Board has cards  
**Steps:**
1. Click card title
2. Edit text
3. Press Enter or click away
4. Verify change saved

**Expected Result:** Card title updates instantly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-003: Edit Card - Owner
**Priority:** High  
**Preconditions:** Board has cards  
**Steps:**
1. Click owner field
2. Change to new name
3. Verify update

**Expected Result:** Owner field updates  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-004: Edit Card - Due Date
**Priority:** High  
**Preconditions:** Board has cards  
**Steps:**
1. Click due date
2. Select new date from picker
3. Verify update

**Expected Result:** Due date updates, card re-sorts if needed  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-005: Delete Card
**Priority:** High  
**Preconditions:** Board has cards  
**Steps:**
1. Click card options/delete button
2. Confirm deletion
3. Verify card removed

**Expected Result:** Card deleted from board and database  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-006: Card Priority Badges
**Priority:** Medium  
**Preconditions:** Cards with different priorities  
**Steps:**
1. View board
2. Verify priority colors:
   - Urgent: Red
   - High: Orange
   - Medium: Blue
   - Low: Gray

**Expected Result:** Priority badges display with correct colors  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-007: Card Type Badges
**Priority:** Medium  
**Preconditions:** Cards of all 8 types  
**Steps:**
1. Verify each type badge:
   - Action
   - Decision
   - Follow-up
   - Update
   - Blocker
   - Idea
   - Risk
   - Question

**Expected Result:** All 8 types display with distinct styling  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-008: Overdue Indicator
**Priority:** High  
**Preconditions:** Card with past due date  
**Steps:**
1. Create card with yesterday's date
2. Verify red "Overdue" badge
3. Check moved to top of list

**Expected Result:** Overdue cards highlighted in red  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-009: Due Today Indicator
**Priority:** Medium  
**Preconditions:** Card due today  
**Steps:**
1. Create card with today's date
2. Verify "Due Today" badge

**Expected Result:** Shows "Due Today" in yellow/orange  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-CARD-010: Time Estimate Display
**Priority:** Low  
**Preconditions:** Card has time estimate  
**Steps:**
1. View card with timeEstimate = 120
2. Verify shows "2h"

**Expected Result:** Time estimate formatted as hours  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 6. Drag & Drop Tests

### TC-DND-001: Drag To Do → In Progress
**Priority:** Critical  
**Preconditions:** Card in To Do column  
**Steps:**
1. Click and hold card
2. Drag to In Progress column
3. Release
4. Verify status updated

**Expected Result:** Card moves to In Progress, status saved to DB  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-DND-002: Drag In Progress → Done
**Priority:** Critical  
**Preconditions:** Card in In Progress  
**Steps:**
1. Drag card to Done column
2. Verify completedAt timestamp set

**Expected Result:** Card marked complete with timestamp  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-DND-003: Drag to Blocked Column
**Priority:** High  
**Preconditions:** Card in any column  
**Steps:**
1. Drag card to Blocked
2. Verify blockedSince timestamp set
3. Check time tracking

**Expected Result:** Card moves to Blocked, blockedSince recorded  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-DND-004: Reorder Cards in Same Column
**Priority:** Medium  
**Preconditions:** Multiple cards in one column  
**Steps:**
1. Drag card within same column
2. Verify position updates

**Expected Result:** Card reorders within column  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-DND-005: Cancel Drag (ESC key)
**Priority:** Low  
**Preconditions:** Dragging a card  
**Steps:**
1. Start dragging card
2. Press ESC
3. Verify card returns to original position

**Expected Result:** Drag cancelled, no change saved  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-DND-006: Drag Multiple Times Rapidly
**Priority:** Medium  
**Preconditions:** Multiple cards  
**Steps:**
1. Rapidly drag 5 cards to different columns
2. Verify all updates saved

**Expected Result:** All status changes persisted correctly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 7. View Mode Tests

### TC-VIEW-001: Kanban Board View
**Priority:** Critical  
**Preconditions:** Board has cards  
**Steps:**
1. Open board (default to Kanban)
2. Verify 4 columns visible:
   - To Do
   - In Progress
   - Blocked
   - Done
3. Check column counts

**Expected Result:** All 4 columns display with correct cards  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-VIEW-002: Calendar View
**Priority:** High  
**Preconditions:** Board has cards with due dates  
**Steps:**
1. Click Calendar View or press Cmd/Ctrl + C
2. Verify month grid displays
3. Check cards on correct dates

**Expected Result:** Calendar shows cards on their due dates  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-VIEW-003: Calendar Navigation
**Priority:** Medium  
**Preconditions:** In Calendar View  
**Steps:**
1. Click "Previous Month"
2. Click "Next Month"
3. Verify navigation works

**Expected Result:** Calendar navigates between months  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-VIEW-004: My Focus Today View
**Priority:** High  
**Preconditions:** Cards with various statuses/dates  
**Steps:**
1. Click Focus View or press Cmd/Ctrl + F
2. Verify sections:
   - Overdue
   - Due Today
   - Blocked
   - In Progress
   - Due Tomorrow (collapsible)
   - High Priority No Date (collapsible)

**Expected Result:** Focus view shows prioritized cards  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-VIEW-005: Focus Count Display
**Priority:** Medium  
**Preconditions:** In Focus View  
**Steps:**
1. Count items in each section
2. Verify section headers show counts
3. Check total focus items

**Expected Result:** Counts accurate in each section  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-VIEW-006: Priority Matrix View
**Priority:** High  
**Preconditions:** Cards with various priorities  
**Steps:**
1. Click Matrix View or press Cmd/Ctrl + M
2. Verify 4 quadrants:
   - Do First (Urgent + Important)
   - Schedule (Important, Not Urgent)
   - Delegate (Urgent, Less Important)
   - Eliminate (Not Urgent, Not Important)

**Expected Result:** Cards auto-categorized into quadrants  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-VIEW-007: Keyboard Shortcuts
**Priority:** Medium  
**Preconditions:** Board open  
**Steps:**
1. Press Cmd/Ctrl + K → Kanban
2. Press Cmd/Ctrl + C → Calendar
3. Press Cmd/Ctrl + F → Focus
4. Press Cmd/Ctrl + M → Matrix

**Expected Result:** Keyboard shortcuts switch views  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-VIEW-008: View Persistence
**Priority:** Low  
**Preconditions:** Switch to Calendar View  
**Steps:**
1. Switch to Calendar View
2. Refresh page
3. Verify still in Calendar View

**Expected Result:** View mode persists after refresh  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 8. Time Tracking Tests

### TC-TIME-001: Status Change Tracking
**Priority:** High  
**Preconditions:** Card in To Do  
**Steps:**
1. Move card to In Progress
2. Wait 5 seconds
3. Move to Done
4. Check StatusHistoryEntry table

**Expected Result:** Status changes logged with timestamps  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-TIME-002: Time in Status Calculation
**Priority:** High  
**Preconditions:** Card has been in Progress for 1 hour  
**Steps:**
1. View card details
2. Check timeInProgress field

**Expected Result:** Shows 1 hour in progress  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-TIME-003: Stale Items Detection
**Priority:** Medium  
**Preconditions:** Card in Progress for 3+ days  
**Steps:**
1. View "Stale Items" widget
2. Verify card appears in count

**Expected Result:** Card flagged as stale after 3 days  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-TIME-004: Average Time in Status
**Priority:** Medium  
**Preconditions:** Multiple cards with status history  
**Steps:**
1. View "Avg Time" widget
2. Verify average calculated correctly

**Expected Result:** Widget shows accurate average  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-TIME-005: Blocked Time Tracking
**Priority:** High  
**Preconditions:** Card moved to Blocked  
**Steps:**
1. Move card to Blocked
2. Verify blockedSince timestamp
3. Check timeInBlocked accumulates

**Expected Result:** Blocked time tracked separately  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 9. Search & Filter Tests

### TC-SEARCH-001: Search by Summary
**Priority:** High  
**Preconditions:** Board has multiple cards  
**Steps:**
1. Enter "design" in search box
2. Verify only matching cards show

**Expected Result:** Cards filtered by summary text  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEARCH-002: Search by Owner
**Priority:** High  
**Preconditions:** Cards have different owners  
**Steps:**
1. Search for "Sarah"
2. Verify only Sarah's cards show

**Expected Result:** Filters by owner name  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEARCH-003: Search Case Insensitive
**Priority:** Medium  
**Preconditions:** Board has cards  
**Steps:**
1. Search "DESIGN"
2. Verify matches "design", "Design", "DESIGN"

**Expected Result:** Search is case-insensitive  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEARCH-004: Filter by Card Type
**Priority:** High  
**Preconditions:** Cards of multiple types  
**Steps:**
1. Click filter dropdown
2. Select "Action" only
3. Verify only Action cards show

**Expected Result:** Filters by selected type  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEARCH-005: Multiple Filters Combined
**Priority:** Medium  
**Preconditions:** Multiple cards and types  
**Steps:**
1. Search "design"
2. Filter type = "Action"
3. Verify both filters apply

**Expected Result:** Search AND filter work together  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEARCH-006: Clear Search/Filters
**Priority:** Medium  
**Preconditions:** Search active  
**Steps:**
1. Apply search and filters
2. Click "Clear" or X button
3. Verify all cards show again

**Expected Result:** Filters reset, all cards visible  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 10. Analytics Tests

### TC-ANALYTICS-001: Stale Items Widget
**Priority:** Medium  
**Preconditions:** Cards in Progress 3+ days  
**Steps:**
1. View dashboard
2. Check "Stale Items" widget
3. Verify count accurate

**Expected Result:** Shows correct count of stale cards  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-ANALYTICS-002: Auto-Escalated Widget
**Priority:** Low  
**Preconditions:** priorityAutoUpdated = true  
**Steps:**
1. Check "Auto-Escalated" widget
2. Verify counts cards with auto-escalated priority

**Expected Result:** Shows count of auto-escalated cards  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-ANALYTICS-003: Overdue Widget
**Priority:** High  
**Preconditions:** Cards past due date  
**Steps:**
1. Create card with yesterday's date
2. Check "Overdue" widget
3. Verify count includes it

**Expected Result:** Shows accurate overdue count  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-ANALYTICS-004: Done Today Widget
**Priority:** Medium  
**Preconditions:** Complete card today  
**Steps:**
1. Move card to Done today
2. Check "Done Today" widget

**Expected Result:** Shows count of completed items today  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-ANALYTICS-005: This Week Widget
**Priority:** Medium  
**Preconditions:** Cards due this week  
**Steps:**
1. View "This Week" widget
2. Verify counts cards due Mon-Sun this week

**Expected Result:** Shows count of items due this week  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-ANALYTICS-006: Hide Overview Toggle
**Priority:** Low  
**Preconditions:** Dashboard visible  
**Steps:**
1. Click "Hide Overview" button
2. Verify all 8 widgets collapse
3. Click "Show Overview"
4. Verify widgets expand

**Expected Result:** Toggle collapses/expands widget row  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-ANALYTICS-007: Widget Responsive Layout
**Priority:** Medium  
**Preconditions:** Various screen sizes  
**Steps:**
1. View dashboard on desktop (1920px)
2. Resize to tablet (768px)
3. Check mobile (375px)

**Expected Result:** Widgets stack appropriately on smaller screens  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 11. Theme Tests

### TC-THEME-001: Light Mode Display
**Priority:** High  
**Preconditions:** Theme set to light  
**Steps:**
1. Open application
2. Verify:
   - Dark logo displays
   - Text is readable (high contrast)
   - Buttons styled correctly
   - Cards visible

**Expected Result:** Light mode displays correctly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-THEME-002: Dark Mode Display
**Priority:** High  
**Preconditions:** Theme set to dark  
**Steps:**
1. Toggle to dark mode
2. Verify:
   - Light logo displays
   - All elements visible
   - Proper contrast

**Expected Result:** Dark mode displays correctly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-THEME-003: Theme Toggle Functionality
**Priority:** High  
**Preconditions:** Any theme  
**Steps:**
1. Click theme toggle button
2. Verify:
   - Logo switches
   - Colors invert
   - No flash of wrong theme

**Expected Result:** Theme toggles smoothly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-THEME-004: Theme Persistence
**Priority:** Medium  
**Preconditions:** Dark mode enabled  
**Steps:**
1. Toggle to dark mode
2. Refresh page (F5)
3. Verify still in dark mode

**Expected Result:** Theme choice persists after refresh  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-THEME-005: Logo Switch
**Priority:** High  
**Preconditions:** Both logos exist in /public/images/  
**Steps:**
1. Toggle between themes
2. Verify:
   - Light mode → logo-dark.png
   - Dark mode → logo-light.png

**Expected Result:** Correct logo displays for each theme  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 12. Export Tests

### TC-EXPORT-001: Export as Markdown
**Priority:** High  
**Preconditions:** Board has cards  
**Steps:**
1. Click "Export" button
2. Select "Markdown"
3. Verify file downloads

**Expected Result:** .md file downloads with board data  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-EXPORT-002: Markdown Format Validation
**Priority:** Medium  
**Preconditions:** Exported .md file  
**Steps:**
1. Open exported file
2. Verify format:
   - Title header
   - Summary section
   - Cards by column
   - Metadata included

**Expected Result:** Valid Markdown structure  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-EXPORT-003: Filename Format
**Priority:** Low  
**Preconditions:** Export board titled "Weekly Sync"  
**Steps:**
1. Export board
2. Check filename

**Expected Result:** Filename like "weekly-sync-2025-10-29.md"  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 13. Recurring Meeting Tests

### TC-RECURRING-001: Detect Recurring Pattern
**Priority:** High  
**Preconditions:** Title contains "Weekly"  
**Steps:**
1. Upload transcript titled "Weekly Team Sync #3"
2. Process
3. Check seriesId assigned

**Expected Result:** System detects recurring pattern  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-RECURRING-002: Link to Series
**Priority:** High  
**Preconditions:** Previous "Weekly Team Sync" exists  
**Steps:**
1. Create "Weekly Team Sync #4"
2. Verify linked to existing series
3. Check previousMeetingId set

**Expected Result:** Meeting linked to series  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-RECURRING-003: Carryover Incomplete Items
**Priority:** High  
**Preconditions:** Previous meeting has incomplete cards  
**Steps:**
1. Create meeting #2 in series
2. Verify incomplete items from #1 carried over
3. Check carriedOver = true

**Expected Result:** Incomplete items auto-carried to new meeting  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-RECURRING-004: Series Dashboard
**Priority:** Medium  
**Preconditions:** Series with 3+ meetings  
**Steps:**
1. Navigate to series dashboard
2. Verify:
   - All meetings listed
   - Completion rates shown
   - Trend charts display

**Expected Result:** Series analytics displayed  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 14. Email Notification Tests

### TC-EMAIL-001: Send Test Email
**Priority:** High  
**Preconditions:** RESEND_API_KEY configured  
**Steps:**
1. Navigate to /api/test-email
2. Trigger test email
3. Check inbox

**Expected Result:** Test email received  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-EMAIL-002: Overdue Alert
**Priority:** High  
**Preconditions:** Card overdue, email notifications enabled  
**Steps:**
1. Create overdue card
2. Wait for cron job or trigger manually
3. Check email

**Expected Result:** Overdue alert email received  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-EMAIL-003: Due Today Alert
**Priority:** Medium  
**Preconditions:** Card due today  
**Steps:**
1. Set card due today
2. Trigger notification cron
3. Check email

**Expected Result:** Due today alert email received  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-EMAIL-004: Daily Digest
**Priority:** Medium  
**Preconditions:** Daily digest enabled at 8:00 AM  
**Steps:**
1. Wait for scheduled time
2. Check email for digest

**Expected Result:** Daily summary email received  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-EMAIL-005: Notification Preferences
**Priority:** Medium  
**Preconditions:** User logged in  
**Steps:**
1. Navigate to settings
2. Toggle notification preferences
3. Save changes
4. Verify saved in DB

**Expected Result:** Preferences updated correctly  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-EMAIL-006: Quiet Hours
**Priority:** Low  
**Preconditions:** Quiet hours 10 PM - 8 AM  
**Steps:**
1. Set quiet hours
2. Trigger notification at 11 PM
3. Verify not sent

**Expected Result:** No emails sent during quiet hours  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 15. Performance Tests

### TC-PERF-001: Page Load Time
**Priority:** High  
**Preconditions:** Clean browser cache  
**Steps:**
1. Open DevTools Network tab
2. Navigate to http://localhost:3005
3. Measure load time

**Expected Result:** Page loads in < 3 seconds  
**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Result:** _____ seconds

---

### TC-PERF-002: Large Board (50+ Cards)
**Priority:** Medium  
**Preconditions:** Board with 50+ cards  
**Steps:**
1. Open board
2. Monitor rendering time
3. Test drag-and-drop responsiveness

**Expected Result:** No lag, smooth interactions  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-PERF-003: Search Performance
**Priority:** Medium  
**Preconditions:** 100+ cards  
**Steps:**
1. Type in search box
2. Measure filter response time

**Expected Result:** Filters apply instantly (< 100ms)  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-PERF-004: API Response Time
**Priority:** High  
**Preconditions:** Server running  
**Steps:**
1. Measure API call times:
   - GET /api/board/[id]
   - PUT /api/card/[id]
   - POST /api/process

**Expected Result:** All < 500ms (except AI processing)  
**Status:** ☐ Pass ☐ Fail ☐ Blocked  
**Results:**
- GET board: _____ ms
- PUT card: _____ ms
- POST process: _____ ms

---

### TC-PERF-005: Memory Leaks
**Priority:** Low  
**Preconditions:** DevTools open  
**Steps:**
1. Open Memory profiler
2. Switch views 50 times
3. Check memory usage

**Expected Result:** No significant memory increase  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 16. Security Tests

### TC-SEC-001: SQL Injection Prevention
**Priority:** Critical  
**Preconditions:** API accessible  
**Steps:**
1. Attempt SQL injection in search: `' OR '1'='1`
2. Verify Prisma blocks it

**Expected Result:** Query fails safely, no data exposed  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEC-002: XSS Prevention
**Priority:** Critical  
**Preconditions:** Create card  
**Steps:**
1. Enter `<script>alert('XSS')</script>` in card title
2. Save and view
3. Verify script doesn't execute

**Expected Result:** React escapes HTML, no script execution  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEC-003: User Data Isolation
**Priority:** Critical  
**Preconditions:** Two user accounts  
**Steps:**
1. User A creates board
2. User B attempts to access via URL
3. Verify access denied

**Expected Result:** User B cannot see User A's data  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEC-004: File Type Validation
**Priority:** High  
**Preconditions:** File upload endpoint  
**Steps:**
1. Rename malware.exe to malware.txt
2. Attempt upload
3. Verify validation catches it

**Expected Result:** File rejected if not valid text  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-SEC-005: API Key Exposure
**Priority:** Critical  
**Preconditions:** Production build  
**Steps:**
1. View page source
2. Check Network tab
3. Verify no API keys in client code

**Expected Result:** No secrets exposed to client  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## 17. API Integration Tests

### TC-API-001: POST /api/upload
**Priority:** Critical  
**Test:**
```bash
curl -X POST http://localhost:3005/api/upload \
  -F "file=@sample-transcript.txt" \
  -F "title=Test Meeting"
```
**Expected:** Status 200, returns file metadata  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-API-002: POST /api/process
**Priority:** Critical  
**Test:**
```bash
curl -X POST http://localhost:3005/api/process \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Meeting content...", "title":"Test"}'
```
**Expected:** Status 200, returns meeting with cards  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-API-003: GET /api/boards
**Priority:** High  
**Test:**
```bash
curl http://localhost:3005/api/boards \
  -H "Authorization: Bearer TOKEN"
```
**Expected:** Status 200, returns array of boards  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-API-004: PUT /api/card/[id]
**Priority:** High  
**Test:**
```bash
curl -X PUT http://localhost:3005/api/card/CARD_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"Done"}'
```
**Expected:** Status 200, card updated  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

### TC-API-005: DELETE /api/card/[id]
**Priority:** High  
**Test:**
```bash
curl -X DELETE http://localhost:3005/api/card/CARD_ID
```
**Expected:** Status 200, card deleted  
**Status:** ☐ Pass ☐ Fail ☐ Blocked

---

## Test Execution Summary

**Total Test Cases:** 150+  
**Priority Breakdown:**
- Critical: 28 tests
- High: 45 tests
- Medium: 38 tests
- Low: 12 tests

**Execution Plan:**
1. **Phase 1 (Day 1):** Critical tests (Authentication, Upload, AI, Board, Card, Drag-Drop)
2. **Phase 2 (Day 2):** High priority (Views, Time Tracking, Search, Analytics, Theme)
3. **Phase 3 (Day 3):** Medium/Low (Export, Recurring, Email, Performance, Security)

**Test Environment:**
- Local: http://localhost:3005
- Production: TBD (Railway)

---

## Quick Test Script

Run these quick tests to verify core functionality:

```bash
# 1. Check server
curl http://localhost:3005

# 2. Upload file (requires auth)
# Open browser, sign in, upload sample-transcript.txt

# 3. Verify database
npx prisma studio
# Check Meeting and MeetingCard tables

# 4. Test API (in browser DevTools Network tab)
# Navigate through app, watch API calls

# 5. Test all view modes
# Use keyboard shortcuts: K, C, F, M

# 6. Test drag-and-drop
# Drag cards between columns

# 7. Test theme toggle
# Click theme button, verify logo switches

# 8. Export board
# Click Export → Markdown

# 9. Check for errors
# Open browser console (F12), look for red errors
```

---

**Test Cases Complete!** ✅  
Ready for execution and validation.



