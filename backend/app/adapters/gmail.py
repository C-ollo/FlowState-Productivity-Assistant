from typing import List, Dict, Any
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.core.config import settings

class GmailAdapter:
    def __init__(self, token: Dict[str, Any]):
        self.creds = Credentials.from_authorized_user_info(token)
        self.service = build('gmail', 'v1', credentials=self.creds)

    def list_messages(self, max_results=10) -> List[Dict[str, Any]]:
        results = self.service.users().messages().list(userId='me', maxResults=max_results).execute()
        messages = results.get('messages', [])
        return messages

    def get_message_content(self, message_id: str) -> Dict[str, Any]:
        message = self.service.users().messages().get(userId='me', id=message_id, format='full').execute()
        
        headers = message['payload']['headers']
        subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
        sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
        
        # Simplistic body extraction
        snippet = message.get('snippet', '')
        
        return {
            "id": message['id'],
            "type": "email",
            "subject": subject,
            "sender": sender,
            "body": snippet, # In real app, parse payload parts for full body
            "timestamp": int(message['internalDate']) / 1000
        }
