# Life Admin Autopilot - Architecture Overview

A modern, scalable full-stack application for intelligent life event management.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   USER (Web Browser)                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    HTTP/HTTPS (REST)
                           │
        ┌──────────────────┴──────────────────┐
        │                                      │
┌───────▼─────────────────┐        ┌──────────▼──────────────┐
│    NEXT.JS FRONTEND     │        │ FASTAPI BACKEND (Python)│
│  (React 19, Tailwind)   │        │   (Core Intelligence)  │
├─────────────────────────┤        ├──────────────────────────┤
│ - Dashboard             │        │ - Task Parser (OpenAI)   │
│ - Task Parser UI        │        │ - Reminder Scheduler     │
│ - Timeline View         │        │ - User Auth              │
│ - Settings              │        │ - Data Validation        │
│ - Responsive Design     │        │ - Background Jobs        │
└──────────┬──────────────┘        └─────────────┬────────────┘
           │                                     │
           └─────────────────┬───────────────────┘
                     JWT Token Exchange
                             │
        ┌────────────────────┴──────────────────┐
        │                                       │
    PostgreSQL Database                  OpenAI API
    (Neon Hosting)                      (GPT-4o-mini)
    
    - Users
    - Tasks
    - Reminders
    - Parsing History
```

## Component Breakdown

### Frontend (Next.js)

**Pages:**
- `/`: Dashboard with task overview
- `/sign-in`: Authentication
- `/sign-up`: User registration
- `/tasks`: All tasks with filtering
- `/tasks/new`: Create single task
- `/reminders`: Reminder management
- `/settings`: User preferences

**Components:**
- `navigation.tsx`: Top navigation with auth
- `task-parser.tsx`: AI text-to-task converter UI
- `task-timeline.tsx`: Timeline view of all tasks

**State Management:**
- localStorage: Auth tokens
- React hooks: Component state
- fetch API: Backend communication

### Backend (FastAPI)

**Routes:**
```
/api/auth/
  - POST /register       → Create user
  - POST /token         → Get JWT token
  - GET /me             → Current user info

/api/tasks/
  - GET /               → List user's tasks
  - POST /              → Create task
  - GET /{id}          → Get specific task
  - PUT /{id}          → Update task
  - DELETE /{id}       → Delete task
  - POST /parse        → Preview parsing
  - POST /parse-and-save → Parse and create

/api/reminders/
  - GET /               → List reminders
  - POST /              → Create reminder
  - POST /auto-create/{task_id} → Auto-create
  - DELETE /{id}       → Delete reminder
  - POST /process-due  → Trigger sending
```

**Services:**
- `ai_parser.py`: OpenAI integration for task parsing
- `reminders.py`: Email/push notification handling
- `database.py`: PostgreSQL connection and migrations

**Data Models:**
```
User
├── id (TEXT)
├── email (TEXT, unique)
├── name (TEXT)
└── timestamps

Task
├── id (INT)
├── user_id (TEXT, foreign key)
├── title, description
├── due_date (TIMESTAMP)
├── priority (low|medium|high)
├── status (pending|in_progress|completed)
├── category (finance|health|work|personal|home|legal)
└── parsed_from (original AI input)

Reminder
├── id (INT)
├── user_id (TEXT)
├── task_id (INT, foreign key)
├── reminder_type (email|push|sms)
├── scheduled_time
├── sent_at
└── status (pending|sent|failed)

ParsingHistory
├── id (INT)
├── user_id (TEXT)
├── raw_input (TEXT)
├── parsed_tasks (JSON)
├── confidence_score
└── created_at
```

### Database (Neon PostgreSQL)

**Tables:**
- `user`: Authentication and user profiles
- `task`: Task data with metadata
- `reminder`: Scheduled notifications
- `parsing_history`: AI parsing audit trail

**Indexes:**
- user_id on tasks and reminders (fast lookups)
- due_date on tasks (timeline queries)
- scheduled_time on reminders (scheduler queries)

## Data Flow

### Creating a Task via AI

1. **User Input**
   ```
   User: "My rent is due March 15"
   ```

2. **Parse Request (Frontend)**
   ```
   POST /api/tasks/parse
   Authorization: Bearer {token}
   Body: { text: "My rent is due March 15" }
   ```

3. **AI Processing (Backend)**
   ```
   - Send to OpenAI GPT-4o-mini
   - Extract: title, due_date, priority, category
   - Return with confidence score
   ```

4. **Save Tasks (Frontend)**
   ```
   POST /api/tasks/parse-and-save
   Creates task records and returns
   ```

5. **Database Storage**
   ```
   INSERT INTO tasks (user_id, title, due_date, priority...)
   INSERT INTO parsing_history (user_id, raw_input, parsed_tasks...)
   ```

### Sending Reminders

1. **Scheduler (Background Job)**
   - Runs every 5 minutes
   - Finds reminders with scheduled_time <= now and status = pending

2. **Process Reminder**
   ```
   - Get task and user details
   - Send email (SMTP) or push notification
   - Update reminder status to "sent"
   ```

3. **Email Template**
   ```
   Subject: Reminder: {task_title}
   Body: Task due on {due_date}
         Link: http://localhost:3000/tasks
   ```

## Security Architecture

### Authentication Flow

1. **User Signs Up**
   ```
   POST /api/auth/register
   → Creates user in database
   → Returns JWT token
   ```

2. **User Signs In**
   ```
   POST /api/auth/token
   → Validates credentials
   → Returns JWT token
   ```

3. **Protected Requests**
   ```
   GET /api/tasks/
   Authorization: Bearer {jwt_token}
   → Backend validates token
   → Returns only user's tasks
   ```

### Security Measures

- **JWT Tokens**: Stateless authentication, 7-day expiry
- **Password Hashing**: Ready for Bcrypt integration
- **User Scoping**: Every query filtered by user_id
- **CORS**: Limited to frontend origin
- **HTTPS Ready**: Database URL enforces SSL
- **Environment Variables**: Secrets not in code

## Scaling Strategy

### Phase 1: MVP (Current)
- Basic task management
- AI parsing
- Email reminders
- Single-server deployment

### Phase 2: Multi-Channel (Weeks 2-3)
```
Add to Backend:
- Twilio integration for WhatsApp/SMS
- Firebase Cloud Messaging for push
- Slack bot for notifications

Add to Frontend:
- Push notification permission UI
- Notification history
- Delivery status tracking
```

### Phase 3: Intelligence (Month 1-2)
```
AI Enhancements:
- Pattern learning (recurring tasks)
- Smart suggestions based on history
- Location-based reminders (geofencing)
- Natural language refinements

New Pages:
- Analytics dashboard
- Task suggestions
- Calendar sync
```

### Phase 4: Collaboration (Month 2-3)
```
Database Changes:
- Team/family entities
- Shared task lists
- Permissions system

New Features:
- Task sharing
- Delegations
- Comments
- Activity feed
```

## Deployment Guide

### Backend Deployment (Render/Railway)

1. **Create account** on Render or Railway
2. **Connect GitHub** repo
3. **Set environment variables**
   ```
   DATABASE_URL=postgresql://...
   OPENAI_API_KEY=sk-...
   JWT_SECRET=random-32-chars
   FRONTEND_URL=https://yourapp.com
   ```
4. **Deploy** - automatic on git push

### Frontend Deployment (Vercel)

1. **Connect GitHub** to Vercel
2. **Set environment variable**
   ```
   NEXT_PUBLIC_API_URL=https://api.yourapp.com
   BETTER_AUTH_SECRET=your-secret
   ```
3. **Deploy** - automatic on git push

### Database (Neon)

- Already hosted and managed
- Automatic backups
- Connection pooling enabled
- Ready for production traffic

## Performance Optimizations

- **Database Queries**: Indexed by user_id and due_date
- **API Response Caching**: 5-minute cache for task lists
- **Background Jobs**: Non-blocking reminder processing
- **Frontend**: Code splitting, lazy loading of components
- **AI Parsing**: Cached responses for identical inputs

## Monitoring & Logging

- **Backend Logs**: Uvicorn logs with request/response
- **Database Logs**: Neon query logs available
- **Error Tracking**: Ready for Sentry integration
- **Performance**: APScheduler job execution logs

## Testing Strategy

```python
# Backend tests
pytest tests/test_auth.py
pytest tests/test_tasks.py
pytest tests/test_parsing.py
pytest tests/test_reminders.py

# Frontend tests
npm run test
```

## Development Workflow

1. **Local Development**
   ```
   Backend: python -m uvicorn app.main:app --reload
   Frontend: npm run dev
   ```

2. **Testing**
   - Manual API testing via /docs
   - UI testing in browser
   - Database queries via psql

3. **Deployment**
   ```
   git add .
   git commit -m "feature: ..."
   git push origin main
   # Automatic deployment triggered
   ```

## Key Technologies & Rationale

| Component | Technology | Why |
|-----------|-----------|-----|
| Backend | FastAPI | Modern, fast, auto-docs, great for APIs |
| Database | PostgreSQL | Reliable, rich features, JSONB for flexibility |
| Frontend | Next.js | SSR ready, file-based routing, great DX |
| Styling | Tailwind | Utility-first, responsive, customizable |
| AI | OpenAI | Best parsing, flexible, reliable |
| Scheduling | APScheduler | Easy background jobs, flexible triggers |
| Auth | JWT + localStorage | Stateless, scalable, simple |

## Future Enhancements

- [ ] Recurring task patterns
- [ ] Task templates
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Voice task creation
- [ ] Browser extension
- [ ] Integration with Google Calendar
- [ ] Slack slash commands
- [ ] Task sharing with families/teams
- [ ] Advanced analytics dashboard
