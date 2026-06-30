# Quick Start Guide - Life Admin Autopilot

Get the app running in minutes!

## Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API key (get one at https://platform.openai.com)
- Neon PostgreSQL connection string (already provided)

## 1. Setup Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Update .env with your values
# Already has DATABASE_URL, just add OPENAI_API_KEY
nano .env

# Start the server
python -m uvicorn app.main:app --reload
```

Backend will be running at: **http://localhost:8000**
API docs: **http://localhost:8000/docs**

## 2. Setup Frontend (2 minutes)

In a new terminal:

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be running at: **http://localhost:3000**

## 3. Test the App

1. Go to **http://localhost:3000/sign-up**
2. Create an account (any email/password works in demo mode)
3. Go to dashboard
4. Click "Add Task with AI" and try:
   - "My rent is due March 15"
   - "Renew my driver's license next month"
   - "Birthday gift for mom in April"

The AI will parse these into structured tasks!

## File Structure

```
/vercel/share/v0-project/
├── backend/                  # Python FastAPI server
│   ├── app/
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # Database models
│   │   ├── database.py      # DB connection
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business logic
│   ├── .env                 # Environment variables
│   └── requirements.txt
├── app/                      # Next.js frontend
│   ├── page.tsx             # Dashboard
│   ├── sign-in/
│   ├── tasks/
│   ├── reminders/
│   └── settings/
├── components/              # React components
│   ├── navigation.tsx
│   ├── task-parser.tsx
│   └── task-timeline.tsx
└── README.md
```

## Key Features

### AI Task Parsing
Input: "my rent is due March" 
Output: Task with title, due date (March 1), priority (high), category (finance)

The AI understands:
- Dates: "next month", "March", "3 weeks from now"
- Priorities: Bills, renewals, licenses → high priority
- Categories: Automatically categorizes as finance, health, personal, etc.

### Task Timeline
- Groups tasks by month
- Shows status (pending, in_progress, completed)
- Filter by priority or status
- Easy to update or delete

### Email Reminders (Optional)
Configure SMTP in `.env` to get email reminders 1 day before due date.

## Common Issues

**CORS Error**: Make sure both servers are running (FastAPI on 8000, Next.js on 3000)

**OpenAI Error**: Check your API key in backend/.env

**Database Error**: Verify DATABASE_URL is correct

**Tasks not loading**: Check browser console for errors, ensure auth token is stored

## Next Steps

1. **Add WhatsApp Reminders**: Install Twilio SDK and integrate
2. **Deploy to Vercel**: Next.js frontend to Vercel, FastAPI to Render/Railway
3. **Add Location-based Reminders**: Get coordinates, send reminders when near location
4. **Sync with Calendar**: Google Calendar, Outlook sync
5. **Team Collaboration**: Share task lists, delegations

## API Endpoints Reference

```bash
# Parse tasks (preview)
curl -X POST http://localhost:8000/api/tasks/parse \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "pay rent March 15"}'

# Create task
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pay rent",
    "due_date": "2024-03-15T00:00:00",
    "priority": "high"
  }'

# Get all tasks
curl -X GET http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer TOKEN"
```

## Support

Check `README.md` for full documentation and troubleshooting.

Happy task organizing!
