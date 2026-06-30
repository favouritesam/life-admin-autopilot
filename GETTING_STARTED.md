# Getting Started - Life Admin Autopilot

Everything you need to know to run the app locally or deploy to production.

## 0. Prerequisites Check

```bash
# Check Python version (need 3.9+)
python3 --version

# Check Node version (need 18+)
node --version
npm --version
```

If any are missing, install them first.

## 1. Configure Backend

### 1.1 Get Your API Keys

1. **OpenAI API Key**
   - Go to https://platform.openai.com/api/keys
   - Click "Create new secret key"
   - Copy it

2. **Database URL** (already provided in project)
   - Located in: `backend/.env` 
   - Should look like: `postgresql://...`

### 1.2 Setup Backend

```bash
# Navigate to backend
cd backend

# Create Python virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate          # macOS/Linux
# or
venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your OpenAI key
nano .env
# Add your key: OPENAI_API_KEY=sk-...
# Save and exit (Ctrl+X, then Y, then Enter)
```

### 1.3 Start Backend Server

```bash
python -m uvicorn app.main:app --reload
```

You should see:
```
Uvicorn running on http://127.0.0.1:8000
```

**Leave this running in your terminal**

## 2. Configure Frontend

### 2.1 Setup Frontend (New Terminal)

```bash
# Make sure you're in project root
cd /vercel/share/v0-project

# Install dependencies
npm install

# Set required environment variable
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### 2.2 Start Frontend Server

```bash
npm run dev
```

You should see:
```
 ▲ Next.js 16.0.0
 - ready started server on 0.0.0.0:3000
```

## 3. Test the Application

### 3.1 Access the App

1. Open browser: http://localhost:3000
2. You'll see the sign-in page

### 3.2 Create an Account

1. Click "Sign up" (or go to http://localhost:3000/sign-up)
2. Fill in:
   - Full Name: Your Name
   - Email: anything@example.com
   - Password: anything (demo mode)
3. Click "Sign Up"

### 3.3 Test AI Task Parsing

1. You're now on the Dashboard
2. Click "Add Task with AI" button
3. In the text area, type one of these:
   ```
   My rent is due March 15
   ```

4. Click "Parse with AI"
5. You'll see the parsed task:
   - Title: "Pay rent"
   - Due Date: March 15, 2024
   - Priority: High
   - Category: Finance

6. Click "Save Tasks" to add it to your list

### 3.4 Try More Examples

After saving the first task, try these:
```
"Renew my driver's license next month"
"Birthday gift for mom in 3 weeks"
"Car insurance renewal March 20"
"Doctor appointment on Friday"
"Annual vacation planning for summer"
```

Watch how the AI parses each one differently!

## 4. Create Tasks Manually

1. Click "Add Manual Task" on dashboard
2. Or go to: http://localhost:3000/tasks/new
3. Fill in:
   - Task Title (required)
   - Description
   - Due Date
   - Priority
   - Category
4. Click "Create Task"

## 5. View Tasks

1. Click "Tasks" in navigation
2. You'll see all your tasks organized by month
3. Filter by status: All, Pending, In Progress, Completed

## 6. Manage Reminders

1. Click "Reminders" in navigation
2. View all scheduled reminders
3. Filter by status: Pending, Sent, Failed
4. Delete any reminder with the "Delete" button

## 7. Settings

1. Click "Settings" in navigation
2. View your account email
3. Configure notification preferences
4. Sign out if needed

## Troubleshooting

### Backend Won't Start

**Error: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
# Make sure you activated venv
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Error: `Connection refused` to database**
```bash
# Check DATABASE_URL in backend/.env
# Verify it's correct (should have postgresql:// prefix)
# Check your internet connection to Neon
```

**Error: OpenAI API error**
```bash
# Verify OPENAI_API_KEY is set correctly
# Check your OpenAI account has credits
# Go to: https://platform.openai.com/account/billing
```

### Frontend Won't Start

**Error: `Port 3000 already in use`**
```bash
# Kill process on port 3000
lsof -i :3000                    # macOS/Linux
# or use different port
npm run dev -- -p 3001
```

**Error: `fetch error` or CORS error**
```bash
# Make sure backend is running (http://localhost:8000)
# Check NEXT_PUBLIC_API_URL in .env.local
# Make sure it's: http://localhost:8000
```

### Tasks Not Loading

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab to see API calls
4. Make sure auth token is set: `localStorage.getItem('auth_token')`

### AI Parsing Not Working

1. Check backend logs for OpenAI errors
2. Verify OPENAI_API_KEY in backend/.env
3. Try simpler text: "Pay rent"
4. Check OpenAI API status: https://status.openai.com

## File Locations Quick Reference

```
Backend server:    http://localhost:8000
API docs:          http://localhost:8000/docs
Frontend app:      http://localhost:3000
Backend code:      /backend/app/
Frontend code:     /app/
Components:        /components/
Database config:   /backend/app/database.py
AI parser:         /backend/app/services/ai_parser.py
```

## Environment Variables Reference

### Backend (.env)
```
DATABASE_URL=postgresql://...     # Provided
OPENAI_API_KEY=sk-...            # Get from OpenAI
JWT_SECRET=your-secret           # Auto-generated
FRONTEND_URL=http://localhost:3000
SMTP_SERVER=smtp.gmail.com       # For email reminders
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Common Commands

```bash
# Start backend
cd backend && python -m uvicorn app.main:app --reload

# Start frontend (different terminal)
npm run dev

# Run backend tests
pytest backend/tests/

# Run frontend tests
npm run test

# Format code
npm run format

# Check types
npm run type-check
```

## What Each File Does

### Backend

- **main.py**: The FastAPI app, sets up scheduler
- **models.py**: Database table definitions
- **database.py**: PostgreSQL connection
- **routes/auth.py**: Authentication endpoints
- **routes/tasks.py**: Task CRUD + AI parsing
- **routes/reminders.py**: Reminder management
- **services/ai_parser.py**: OpenAI integration
- **services/reminders.py**: Email/notification sending

### Frontend

- **page.tsx**: Main dashboard
- **sign-in/page.tsx**: Login page
- **tasks/page.tsx**: All tasks view
- **tasks/new/page.tsx**: Create task form
- **reminders/page.tsx**: Reminders list
- **settings/page.tsx**: User settings
- **components/navigation.tsx**: Top nav
- **components/task-parser.tsx**: AI parser UI
- **components/task-timeline.tsx**: Timeline view

## Next Steps

1. **Get it running** - Follow steps 1-3 above
2. **Play with it** - Create tasks, test AI parsing
3. **Customize** - Change colors, add features
4. **Deploy** - Follow DEPLOYMENT.md
5. **Scale** - Add WhatsApp, SMS, push notifications

## Getting Help

1. Check the error in terminal/console
2. Search for the error in README.md
3. Read ARCHITECTURE.md for system overview
4. Review the relevant source code file

## Example Workflow

```
1. Sign up with email
2. See empty dashboard
3. Click "Add Task with AI"
4. Type: "Pay rent March 15"
5. Click "Parse with AI"
6. Review the parsed task
7. Click "Save Tasks"
8. See task in timeline
9. Click "Reminders"
10. See auto-created reminder (1 day before)
11. Settings → adjust preferences
12. Done! Your life is organized.
```

## Video Demo Walkthrough

While we can't show you a video, here's what you'll see:

**Timeline:**
- Dashboard loads with welcome message
- Click AI parser button
- Text appears in textarea
- Type "My car insurance is due March 20"
- Click "Parse with AI"
- Spinner appears for 1-2 seconds
- Parsed task appears: "Renew car insurance" on 3/20, high priority
- Click "Save Tasks"
- Snackbar shows "Created 1 tasks"
- See task in timeline under "March 2024"
- Auto-created reminder appears in /reminders page

This is the power of the AI-powered task parsing!

## Summary

You now have a **fully functional life management app**:

- Create tasks with AI (just describe them!)
- Get automatic reminders
- Organize by priority and category
- Works on any device
- Ready to scale

**All set to start?** Run the backend and frontend, then go to http://localhost:3000!
