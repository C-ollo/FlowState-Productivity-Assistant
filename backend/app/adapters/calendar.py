from typing import List, Dict, Any
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import datetime

class CalendarAdapter:
    def __init__(self, token: Dict[str, Any]):
        self.creds = Credentials.from_authorized_user_info(token)
        self.service = build('calendar', 'v3', credentials=self.creds)

    def list_upcoming_events(self, max_results=10) -> List[Dict[str, Any]]:
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = self.service.events().list(
            calendarId='primary', timeMin=now,
            maxResults=max_results, singleEvents=True,
            orderBy='startTime'
        ).execute()
        events = events_result.get('items', [])
        
        processed = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            processed.append({
                "id": event['id'],
                "type": "event",
                "subject": event.get('summary', 'No Title'),
                "sender": event.get('creator', {}).get('email'),
                "body": event.get('description', ''),
                "timestamp": start # Needs parsing in real app
            })
        return processed
