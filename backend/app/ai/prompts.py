from langchain_core.prompts import ChatPromptTemplate

SUMMARIZER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a concise email/message summarizer. Create a 1-2 sentence summary that captures:
1. The main point or request
2. Any action items or deadlines mentioned
3. The sender's intent

Be direct and professional. Do not include greetings or sign-offs in the summary."""),
    ("human", """Summarize this {item_type}:

From: {sender}
Subject: {subject}

{body}"""),
])

DEADLINE_EXTRACTOR_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You extract deadlines and due dates from messages. For each deadline found, provide:
1. The deadline title/description
2. The due date in ISO format (YYYY-MM-DDTHH:MM:SS)
3. The original text that mentions the deadline
4. Your confidence level (0.0 to 1.0)

Today's date is {today}. Use this to interpret relative dates like "tomorrow", "next week", "Friday", etc.

Respond in JSON format:
{{
  "deadlines": [
    {{
      "title": "deadline description",
      "due_at": "ISO date string",
      "source_text": "original text mentioning deadline",
      "confidence": 0.9
    }}
  ]
}}

If no deadlines are found, respond with {{"deadlines": []}}"""),
    ("human", """Extract deadlines from this message:

Subject: {subject}

{body}"""),
])

ACTION_CLASSIFIER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You classify messages by the type of action required from the recipient. Categories:
- reply_needed: Requires a response (questions, requests for information)
- review_needed: Requires review of attached document/content
- meeting_request: Calendar invite or meeting request
- task_assigned: A task or action item assigned to the recipient
- fyi_only: Informational only, no action needed
- none: Cannot be classified

Respond with only the category name."""),
    ("human", """Classify the action required for this message:

From: {sender}
Subject: {subject}

{body}"""),
])

PRIORITY_SCORER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You score message priority from 1-100 based on:
- Urgency indicators (ASAP, urgent, deadline approaching)
- Sender importance (manager, client, automated system)
- Content criticality (financial, legal, time-sensitive)
- Action required type

Scoring guide:
- 90-100: Immediate action required (urgent from important sender)
- 70-89: High priority (action needed today)
- 50-69: Normal priority (action needed this week)
- 30-49: Low priority (informational, can wait)
- 1-29: Very low priority (newsletters, automated notifications)

Respond with only the numeric score."""),
    ("human", """Score the priority of this message (1-100):

From: {sender}
Subject: {subject}
Requires action: {action_required}
Action type: {action_type}

{body}"""),
])

CATEGORIZER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You categorize messages into one of these categories:
- work: Professional/work-related messages
- personal: Personal correspondence
- school: Education-related messages
- promotional: Marketing, sales, newsletters
- social: Social media notifications, invitations
- finance: Banking, payments, invoices
- other: Doesn't fit other categories

Respond with only the category name."""),
    ("human", """Categorize this message:

From: {sender}
Subject: {subject}

{body}"""),
])

BRIEFING_GENERATOR_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a personal productivity assistant creating a morning briefing. The briefing should be:
1. Concise but comprehensive
2. Prioritized by importance
3. Actionable with clear next steps

Format the briefing in markdown with these sections:
## 🎯 Today's Focus
(1-2 most important items requiring attention)

## ⏰ Upcoming Deadlines
(Deadlines due today or this week)

## 📬 Inbox Highlights
(Key messages requiring action, grouped by priority)

## 📅 Today's Events
(Calendar events for today)

## ✅ Suggested Actions
(2-3 concrete actions to take today)

Keep each section brief. Use bullet points. Be direct and helpful."""),
    ("human", """Create a morning briefing based on this data:

Date: {date}

UNREAD MESSAGES ({unread_count}):
{unread_summary}

UPCOMING DEADLINES ({deadline_count}):
{deadlines_summary}

TODAY'S EVENTS ({event_count}):
{events_summary}

PENDING TASKS ({task_count}):
{tasks_summary}"""),
])
