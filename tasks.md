You are a Senior Staff Software Engineer and Solution Architect.

Your task is NOT to rebuild the application from scratch.

First inspect the entire project, understand the current architecture, identify the existing database, authentication, storage, websocket implementation, APIs, frontend state management and then fix everything while preserving the existing codebase.

====================================================
STEP 1 - ANALYZE THE PROJECT
====================================================

Before changing anything, inspect and document:

1. Which frontend framework is being used
2. Which backend framework is being used
3. Current database being used
4. Current ORM (Prisma, Drizzle, Sequelize, TypeORM, etc.)
5. Authentication provider
6. File storage provider
7. WebSocket implementation
8. Current folder structure
9. Existing API routes
10. Existing database schema
11. Environment variables currently required

Then explain:

- What database is currently connected?
- Is it SQLite?
- PostgreSQL?
- Supabase?
- Firebase?
- MongoDB?
- Local database?

Do NOT assume anything.

Inspect the project and tell me exactly what is currently being used.

====================================================
STEP 2 - DATABASE MIGRATION
====================================================

If the project is NOT already using Neon PostgreSQL, migrate everything to Neon.

Use this database:

postgresql://neondb_owner:npg_FSgIBhm5CLa2@ep-twilight-leaf-ah5818zn.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require

Requirements:

• Update ORM configuration
• Update environment variables
• Run migrations
• Preserve all existing tables
• Preserve relationships
• Preserve authentication
• Preserve chats
• Preserve users
• Preserve messages
• Preserve groups
• Preserve notifications
• Preserve profile data

Do not break existing functionality.

====================================================
STEP 3 - FIREBASE ANALYSIS
====================================================

Analyze whether Firebase is needed.

If Firebase provides advantages for:

- Push Notifications
- Authentication
- Realtime Sync
- Storage

Explain the pros and cons.

If Firebase is NOT required, keep Neon PostgreSQL.

If Firebase should only be used for push notifications, configure Firebase Cloud Messaging only.

Do NOT migrate the entire database into Firebase unless absolutely necessary.

====================================================
STEP 4 - CLOUDINARY
====================================================

Connect Cloudinary completely.

Read the Cloudinary credentials from environment variables.

Implement:

✔ Profile Picture Upload

✔ Cover Photo Upload

✔ Image Compression

✔ Automatic resizing

✔ Delete old images when replacing

✔ Store ONLY image URLs inside PostgreSQL

Images must NOT be stored inside database.

Profile page should include:

• Avatar Upload
• Cover Photo Upload
• Edit Profile
• Live Preview
• Loading State
• Error Handling

====================================================
STEP 5 - FIX CHAT SYSTEM
====================================================

Fix ALL existing chat issues.

Issue 1

Currently newest messages appear at the TOP.

Fix it.

Messages must behave exactly like WhatsApp.

Oldest message

↓

Newest message at bottom

Auto-scroll to newest message.

====================================================

Issue 2

Latest message sometimes doesn't appear.

Find why.

Possible causes:

• stale cache

• websocket issue

• optimistic updates

• state mutation

• incorrect sorting

Fix permanently.

====================================================

Issue 3

Dashboard recent chats are not showing latest message.

Recent chats should always display:

• latest message

• latest timestamp

• unread count

• online indicator

Sort conversations by latest activity.

====================================================

Issue 4

Clicking a conversation sometimes clears chat until refresh.

Investigate:

• React state

• Query cache

• Router

• Zustand/Redux

• React Query

• API calls

Fix without requiring refresh.

====================================================

Issue 5

Emoji button not working.

Implement:

😀 Emoji Picker

Insert emoji at cursor

Close on outside click

Works on mobile

====================================================

Issue 6

Attachment button not working.

Implement uploads for:

Images

Videos

Documents

PDF

ZIP

Audio

Store attachments in Cloudinary.

Show upload progress.

Preview before sending.

====================================================

Issue 7

Three-dot menu not working.

Implement:

View Profile

Mute Notifications

Search Chat

Delete Chat

Block User

Report User

Archive Chat

Pin Chat

Mark as Unread

Everything functional.

====================================================

Issue 8

Send arrow alignment.

Currently arrow is in middle.

Move it to end exactly like WhatsApp.

Responsive on desktop/mobile.

====================================================

Issue 9

Notifications.

Implement real-time notifications.

When receiving message:

Desktop notification

Browser notification

Notification badge

Unread count

Sound

Popup

Realtime updates.

====================================================

Issue 10

Unread count never resets.

When user opens conversation:

Unread count becomes zero.

Database updates.

Dashboard updates.

Sidebar updates.

Realtime updates.

====================================================
STEP 6 - GROUP CHAT
====================================================

Implement complete WhatsApp-style Groups.

Features:

Create Group

Choose Members

Group Avatar

Group Cover

Rename Group

Admin

Multiple Admins

Remove Members

Leave Group

Delete Group

Group Info

Group Media

Pinned Messages

====================================================
STEP 7 - CHAT IMPROVEMENTS
====================================================

Implement:

✔ Typing indicator

✔ Online status

✔ Last Seen

✔ Delivered

✔ Read Receipts

✔ Double Tick

✔ Blue Tick

✔ Infinite Scroll

✔ Lazy Loading

✔ Date Separators

✔ Message Search

✔ Reply

✔ Forward

✔ Edit Message

✔ Delete for Me

✔ Delete for Everyone

✔ Copy Message

✔ Starred Messages

✔ Pinned Messages

✔ Voice Notes

✔ Image Preview

✔ Video Preview

✔ Drag & Drop Upload

✔ Mobile Responsive

====================================================
STEP 8 - PERFORMANCE
====================================================

Optimize:

React Rendering

Queries

Database Indexes

Pagination

Infinite Loading

Memoization

WebSocket reconnect

Debouncing

Lazy Loading

Virtualized Messages

====================================================
STEP 9 - SECURITY
====================================================

Validate:

Authentication

Authorization

SQL Injection

XSS

CSRF

Rate Limiting

File Validation

File Size Limits

JWT Security

Input Validation

====================================================
STEP 10 - FINAL REVIEW
====================================================

After implementing everything:

1. Search entire project for bugs.

2. Fix TypeScript errors.

3. Fix ESLint warnings.

4. Remove dead code.

5. Remove duplicate components.

6. Improve folder structure.

7. Ensure no console errors.

8. Ensure no hydration errors.

9. Ensure no API failures.

10. Ensure production build succeeds.

====================================================
FINAL OUTPUT
====================================================

Provide:

1. Existing database detected.

2. ORM detected.

3. Authentication detected.

4. Storage detected.

5. Changes made.

6. Files modified.

7. Database migrations executed.

8. Remaining issues if any.

9. Commands to run.

10. Production readiness checklist.

Do not stop until every issue above is fixed and verified.