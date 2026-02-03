from typing import List, Dict, Any
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

class SlackAdapter:
    def __init__(self, token: str):
        self.client = WebClient(token=token)

    def list_channels(self) -> List[Dict[str, Any]]:
        try:
            response = self.client.conversations_list()
            return response["channels"]
        except SlackApiError as e:
            print(f"Error fetching conversations: {e}")
            return []

    def get_channel_history(self, channel_id: str, limit=10) -> List[Dict[str, Any]]:
        try:
            result = self.client.conversations_history(channel=channel_id, limit=limit)
            messages = result["messages"]
            processed = []
            for msg in messages:
                processed.append({
                    "id": msg.get("ts"),
                    "type": "message",
                    "subject": f"Message in {channel_id}", 
                    "sender": msg.get("user"),
                    "body": msg.get("text", ""),
                    "timestamp": float(msg.get("ts", 0))
                })
            return processed
        except SlackApiError as e:
            print(f"Error fetching history: {e}")
            return []
