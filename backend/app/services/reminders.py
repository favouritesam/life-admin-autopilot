import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from sqlmodel import Session, select
from app.models import Reminder, Task, User
from app.database import engine


def send_email_reminder(user_email: str, task_title: str, due_date: str):
    """Send email reminder to user"""
    
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_email = os.getenv("SMTP_USER")
    sender_password = os.getenv("SMTP_PASSWORD")
    
    if not all([sender_email, sender_password]):
        print("SMTP credentials not configured")
        return False
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = f"Reminder: {task_title}"
        message["From"] = sender_email
        message["To"] = user_email
        
        # HTML email body
        html = f"""\
        <html>
            <body>
                <h2>Task Reminder</h2>
                <p>You have an upcoming task:</p>
                <h3>{task_title}</h3>
                <p>Due: {due_date}</p>
                <p><a href="http://localhost:3000/tasks">View all tasks</a></p>
            </body>
        </html>
        """
        
        part = MIMEText(html, "html")
        message.attach(part)
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, user_email, message.as_string())
        
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_push_notification(user_id: str, task_title: str):
    """
    Send push notification (placeholder - can integrate with Firebase, etc.)
    """
    print(f"Push notification to {user_id}: {task_title}")
    return True


def mark_reminder_sent(reminder_id: int):
    """Mark reminder as sent in database"""
    with Session(engine) as session:
        reminder = session.get(Reminder, reminder_id)
        if reminder:
            reminder.sent_at = datetime.utcnow()
            reminder.status = "sent"
            session.add(reminder)
            session.commit()


def process_due_reminders():
    """Process reminders that are due to be sent"""
    
    with Session(engine) as session:
        # Get all pending reminders that are due
        statement = select(Reminder).where(
            Reminder.status == "pending",
            Reminder.scheduled_time <= datetime.utcnow()
        )
        reminders = session.exec(statement).all()
        
        for reminder in reminders:
            # Get task and user info
            task = session.get(Task, reminder.task_id)
            user = session.get(User, reminder.user_id)
            
            if task and user:
                # Send reminder based on type
                success = False
                if reminder.reminder_type == "email":
                    success = send_email_reminder(
                        user.email,
                        task.title,
                        task.due_date.strftime("%Y-%m-%d") if task.due_date else "N/A"
                    )
                elif reminder.reminder_type == "push":
                    success = send_push_notification(reminder.user_id, task.title)
                
                # Update status
                if success:
                    mark_reminder_sent(reminder.id)
                else:
                    reminder.status = "failed"
                    session.add(reminder)
                    session.commit()
