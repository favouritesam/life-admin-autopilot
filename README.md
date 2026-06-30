# Life Admin Autopilot

A full-stack application for managing everyday life events, deadlines, and reminders using AI-powered natural language parsing.

## Features

- **AI Task Parsing**: Convert natural language into structured tasks (e.g., "my rent is due March" → Task with due date and high priority)
- **Smart Timeline**: Organized view of all your tasks grouped by date
- **Reminders**: Automatic email reminders for upcoming tasks
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Real-time Updates**: See task changes instantly across all views

## Tech Stack

### Backend
- **FastAPI** (Python): Modern, fast API framework
- **PostgreSQL** (Neon): Reliable database
- **OpenAI API**: For intelligent task parsing
- **APScheduler**: Background job scheduling for reminders
- **SQLModel**: Type-safe database ORM

### Frontend
- **Next.js 16**: React framework with server components
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: High-quality UI components
- **Better Auth**: Secure authentication

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL/Neon account
- OpenAI API key

### Backend Setup

1. **Create virtual environment:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your values:
   # - DATABASE_URL: Your Neon PostgreSQL connection string
   # - OPENAI_API_KEY: Your OpenAI API key
   # - SMTP settings: For email reminders (optional)
   ```

4. **Run the server:**
   ```bash
   python -m uvicorn app.main:app --reload
   ```

   API will be available at `http://localhost:8000`
   Docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Update BETTER_AUTH_SECRET in Vercel dashboard
   # Frontend automatically connects to http://localhost:8000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/token` - Get JWT token
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks/` - Get all tasks
- `POST /api/tasks/` - Create a task
- `GET /api/tasks/{id}` - Get specific task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/parse` - Parse natural language to tasks (preview)
- `POST /api/tasks/parse-and-save` - Parse and immediately save tasks

### Reminders
- `GET /api/reminders/` - Get all reminders
- `POST /api/reminders/` - Create reminder
- `POST /api/reminders/auto-create/{task_id}` - Auto-create reminder (1 day before)
- `DELETE /api/reminders/{id}` - Delete reminder

## Usage Examples

### Parsing Tasks with AI

```bash
curl -X POST http://localhost:8000/api/tasks/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "My rent is due March 15. Renew car insurance next month. Buy birthday gift for mom."
  }'
```

Response:
```json
{
  "tasks": [
    {
      "title": "Pay rent",
      "due_date": "2024-03-15",
      "priority": "high",
      "category": "finance"
    },
    {
      "title": "Renew car insurance",
      "due_date": "2024-04-15",
      "priority": "high",
      "category": "finance"
    },
    {
      "title": "Buy birthday gift for mom",
      "due_date": "2024-04-20",
      "priority": "medium",
      "category": "personal"
    }
  ],
  "confidence": 0.95
}
```

## Database Schema

### Users
- `id` (TEXT): User identifier
- `email` (TEXT): User email (unique)
- `name` (TEXT): User full name
- `created_at` (TIMESTAMP): Account creation date

### Tasks
- `id` (INT): Task ID
- `user_id` (TEXT): Owner of the task
- `title` (TEXT): Task title
- `description` (TEXT): Optional description
- `due_date` (TIMESTAMP): When the task is due
- `priority` (TEXT): low, medium, high
- `status` (TEXT): pending, in_progress, completed
- `category` (TEXT): finance, health, work, personal, etc.
- `parsed_from` (TEXT): Original text if parsed by AI

### Reminders
- `id` (INT): Reminder ID
- `user_id` (TEXT): User who will be reminded
- `task_id` (INT): Associated task
- `reminder_type` (TEXT): email, push, sms
- `scheduled_time` (TIMESTAMP): When to send
- `sent_at` (TIMESTAMP): When it was actually sent
- `status` (TEXT): pending, sent, failed

## Scaling to Production

### Phase 1: Core MVP (Current)
- Basic task management
- AI parsing with OpenAI
- Email reminders
- Simple auth

### Phase 2: Multi-Channel
- WhatsApp reminders (Twilio integration)
- Push notifications (Firebase Cloud Messaging)
- SMS reminders
- Slack integration

### Phase 3: Advanced Intelligence
- Task suggestions based on user patterns
- Location-based reminders
- Natural language improvements with more context
- Analytics dashboard

### Phase 4: Collaboration
- Shared task lists
- Delegations
- Family/team calendars
- Comments and updates

## Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Verify Neon connection is active
- Try resetting the password in Neon dashboard

### OpenAI API Error
- Verify `OPENAI_API_KEY` is set correctly
- Check your OpenAI account has credits
- Confirm API key has appropriate permissions

### CORS Error
- Make sure FastAPI server is running
- Check `FRONTEND_URL` in backend `.env`
- Verify origin is in CORS allowlist

## License

MIT
