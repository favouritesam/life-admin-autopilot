import json
import os
from datetime import datetime, timedelta
from typing import Optional
from openai import OpenAI
import re
from app.models import TaskCreate

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def parse_natural_language_task(text: str) -> tuple[list[TaskCreate], float]:
    """
    Parse natural language input into structured tasks using OpenAI.
    Returns list of tasks and confidence score.
    
    Examples:
    - "my rent is due March" -> Task(title="Pay rent", due_date="2026-03-01", priority="high")
    - "renew driver's license next month" -> Task(title="Renew driver's license", due_date="2026-07-15")
    """
    
    prompt = f"""
    Parse the following life event/task into structured JSON tasks. 
    Be intelligent about extracting dates, deadlines, and priorities.
    
    Today's date is: {datetime.now().strftime('%Y-%m-%d')}
    
    Input: "{text}"
    
    Return a JSON object with:
    {{
        "tasks": [
            {{
                "title": "Task title",
                "description": "Optional description with context",
                "due_date": "YYYY-MM-DD or null if unclear",
                "priority": "low|medium|high",
                "category": "finance|health|legal|home|work|personal"
            }}
        ],
        "confidence": 0.0-1.0,
        "reasoning": "Why you parsed it this way"
    }}
    
    Guidelines:
    - If no specific date mentioned, infer from context ("next month" = 1 month from now, "March" = March 1st)
    - Urgent items (bills, licenses, renewals) should be high priority
    - Personal health items = high priority
    - Vague deadlines = medium priority by default
    - Create multiple tasks if multiple events mentioned
    - Be practical: "rent is due March" = "Pay rent" on March 1st, HIGH priority
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
        )
        
        response_text = response.choices[0].message.content
        
        # Extract JSON from response
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if not json_match:
            return [], 0.0
        
        parsed = json.loads(json_match.group())
        
        # Convert to TaskCreate objects
        tasks = []
        for task_data in parsed.get("tasks", []):
            due_date = None
            if task_data.get("due_date"):
                try:
                    due_date = datetime.strptime(task_data["due_date"], "%Y-%m-%d")
                except:
                    pass
            
            task = TaskCreate(
                title=task_data.get("title", ""),
                description=task_data.get("description"),
                due_date=due_date,
                priority=task_data.get("priority", "medium"),
                category=task_data.get("category")
            )
            tasks.append(task)
        
        confidence = float(parsed.get("confidence", 0.5))
        return tasks, confidence
        
    except Exception as e:
        print(f"Error parsing task: {e}")
        return [], 0.0


def suggest_next_action(task_title: str, task_category: Optional[str] = None) -> str:
    """
    Use AI to suggest what user should do next based on task.
    """
    
    prompt = f"""
    Given this life admin task, suggest the next practical action the user should take.
    Be brief and actionable.
    
    Task: "{task_title}"
    Category: {task_category or "general"}
    
    Respond with just the action (1-2 sentences).
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=100,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating suggestion: {e}")
        return "Start working on this task"
