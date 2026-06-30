# Life Admin Autopilot - Documentation Index

Complete guide to understanding and using the system.

## Start Here

**New to the project?** Start with these in order:

1. **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - What you've built (5 min read)
   - Overview of features
   - Tech stack
   - Key accomplishments
   - Scaling roadmap

2. **[GETTING_STARTED.md](GETTING_STARTED.md)** - Setup & run locally (10 min)
   - Prerequisites
   - Backend setup
   - Frontend setup
   - First test

3. **[QUICK_START.md](QUICK_START.md)** - 5-minute quick setup
   - Minimal steps to running
   - Demo mode
   - Basic testing

## Deep Dives

**Want to understand the system?**

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System design (20 min)
  - Component breakdown
  - Data flow
  - Security architecture
  - Scaling strategy
  - Database schema
  - Performance optimization

- **[README.md](README.md)** - Full documentation (30 min)
  - Feature list
  - Complete setup guide
  - API endpoints reference
  - Database schema details
  - Troubleshooting guide
  - Deployment instructions

## Quick Reference

### File Structure
```
backend/              # Python FastAPI backend
├── app/main.py       # FastAPI app
├── app/models.py     # Database models
├── app/routes/       # API endpoints
├── app/services/     # Business logic
└── requirements.txt  # Dependencies

app/                  # Next.js frontend
├── page.tsx          # Dashboard
├── sign-in/          # Auth pages
├── tasks/            # Task pages
└── globals.css       # Styling

components/          # React components
└── *.tsx
```

### Core Endpoints

**Authentication**
```
POST   /api/auth/register    - Create account
POST   /api/auth/token       - Get JWT token
GET    /api/auth/me          - Current user
```

**Tasks**
```
GET    /api/tasks/           - List all
POST   /api/tasks/           - Create
PUT    /api/tasks/{id}       - Update
DELETE /api/tasks/{id}       - Delete
POST   /api/tasks/parse      - Preview AI parse
POST   /api/tasks/parse-and-save - Parse & create
```

**Reminders**
```
GET    /api/reminders/       - List all
POST   /api/reminders/       - Create
DELETE /api/reminders/{id}   - Delete
POST   /api/reminders/auto-create/{task_id} - Auto-create
```

### Database Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| users | User accounts | id, email, name |
| tasks | All tasks | id, user_id, title, due_date, priority |
| reminders | Scheduled notifications | id, task_id, scheduled_time, status |
| parsing_history | AI parsing logs | id, raw_input, parsed_tasks, confidence_score |

### Key Environment Variables

**Backend (.env)**
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - JWT signing secret
- `SMTP_USER` / `SMTP_PASSWORD` - For email reminders

**Frontend (.env.local)**
- `NEXT_PUBLIC_API_URL` - Backend URL

## By Role

### I'm a User
Start with: **GETTING_STARTED.md**
- How to sign up
- How to create tasks with AI
- How to set reminders
- How to view your timeline

### I'm a Developer
Read in this order:
1. PROJECT_SUMMARY.md - Overview
2. ARCHITECTURE.md - System design
3. Code in `backend/app/` and `app/` directories
4. README.md - Specific implementation details

### I'm Deploying
Follow: **README.md → Deployment Guide** section
Then:
- Render for backend
- Vercel for frontend
- Neon for database (already configured)

### I'm Scaling
Read: **ARCHITECTURE.md → Scaling Strategy**
Then implement features from:
- Phase 2: Multi-channel reminders
- Phase 3: Advanced intelligence
- Phase 4: Collaboration features

## How To...

### How to add WhatsApp reminders?
See: ARCHITECTURE.md → Phase 2: Multi-Channel

### How to deploy to production?
See: README.md → Deployment Guide

### How to create a recurring task?
See: ARCHITECTURE.md → Phase 3: Advanced Intelligence

### How to sync with Google Calendar?
See: ARCHITECTURE.md → Phase 3: Advanced Intelligence

### How to troubleshoot an error?
1. Check terminal/console for exact error
2. Search in README.md
3. Read ARCHITECTURE.md for system context

## Feature Roadmap

### Current (MVP)
- ✅ Task creation (manual + AI)
- ✅ Email reminders
- ✅ Timeline view
- ✅ Priority/category system

### Next (Phase 2)
- [ ] WhatsApp reminders (Twilio)
- [ ] Push notifications (Firebase)
- [ ] SMS reminders
- [ ] Slack integration

### Later (Phase 3)
- [ ] Recurring task patterns
- [ ] Location-based reminders
- [ ] Smart suggestions
- [ ] Calendar sync

### Future (Phase 4)
- [ ] Team/family sharing
- [ ] Mobile app (React Native)
- [ ] Voice task creation
- [ ] Advanced analytics

## Common Questions

**Q: Where's the database?**
A: Neon PostgreSQL (hosted cloud). Connection string in backend/.env

**Q: How do I get an OpenAI key?**
A: https://platform.openai.com/api/keys → Create new secret key

**Q: Can I use a different database?**
A: Yes, update DATABASE_URL. Uses SQLAlchemy so supports many DBs.

**Q: How do I deploy?**
A: Backend to Render/Railway, Frontend to Vercel, Database is Neon (done).

**Q: Can I customize the colors?**
A: Yes, edit `app/globals.css` theme variables.

**Q: How do I add SMS reminders?**
A: Add Twilio SDK to backend, update reminders service.

## Performance Tips

- API responses: ~200ms (plus OpenAI latency)
- Database queries: <50ms (indexed)
- Page loads: <2s (optimized)
- Reminder processing: Every 5 minutes

## Security Checklist

✅ JWT authentication
✅ User-scoped queries
✅ HTTPS ready
✅ Environment variables for secrets
✅ CORS protection
✅ SQL injection prevention (ORM)

## Support Resources

- **Error in backend?** Check `backend/.env` and terminal logs
- **Error in frontend?** Check browser console (F12)
- **Database error?** Verify DATABASE_URL, test with `psql`
- **OpenAI error?** Check API key and account billing
- **Deployment error?** Review platform-specific docs

## Technology Quick Links

- FastAPI: https://fastapi.tiangolo.com
- SQLModel: https://sqlmodel.tiangolo.com
- Next.js: https://nextjs.org
- Tailwind: https://tailwindcss.com
- OpenAI: https://platform.openai.com
- PostgreSQL: https://www.postgresql.org
- Neon: https://neon.tech

## What's in Each File?

| File | Size | Purpose |
|------|------|---------|
| PROJECT_SUMMARY.md | 357 lines | Complete overview |
| GETTING_STARTED.md | 376 lines | Setup & first test |
| QUICK_START.md | 154 lines | Minimal quick setup |
| ARCHITECTURE.md | 388 lines | System design deep dive |
| README.md | 223 lines | Full documentation |
| DOCS.md | This file | Documentation index |
| backend/app/main.py | 85 lines | FastAPI app |
| backend/app/models.py | 80 lines | Database models |
| backend/app/routes/tasks.py | 197 lines | Task API |
| app/page.tsx | 100 lines | Dashboard page |
| components/task-parser.tsx | 163 lines | AI parser UI |
| components/task-timeline.tsx | 169 lines | Timeline view |

## Next Steps

1. **Read PROJECT_SUMMARY.md** (5 minutes)
2. **Follow GETTING_STARTED.md** (10 minutes)
3. **Test the app** (5 minutes)
4. **Read ARCHITECTURE.md** for deep understanding
5. **Deploy** using README.md guide
6. **Add features** from roadmap

---

**Questions?** Check README.md or ARCHITECTURE.md first.
**Ready to deploy?** Go to README.md → Deployment Guide.
**Want to understand the code?** Read ARCHITECTURE.md.
**Just want to run it?** Follow GETTING_STARTED.md.
