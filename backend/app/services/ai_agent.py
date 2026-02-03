from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from app.services.llm_factory import LLMFactory

class AIService:
    def __init__(self):
        self.llm = LLMFactory.create_llm()

    async def summarize_email(self, content: str) -> str:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an expert executive assistant. Summarize the following email in 1-2 concise sentences."),
            ("user", "{content}")
        ])
        chain = prompt | self.llm | StrOutputParser()
        return await chain.ainvoke({"content": content})

    async def extract_deadlines(self, content: str) -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Extract any deadlines from the text. Return JSON format with fields: 'has_deadline' (bool), 'deadlines' (list of objects with 'title', 'due_date', 'confidence'). Return empty list if none."),
            ("user", "{content}")
        ])
        chain = prompt | self.llm | JsonOutputParser()
        return await chain.ainvoke({"content": content})

    async def classify_action(self, content: str) -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Analyze if this message requires user action. Return JSON: 'action_required' (bool), 'action_type' (str: 'review', 'reply', 'meeting', 'fyi', 'other')."),
            ("user", "{content}")
        ])
        chain = prompt | self.llm | JsonOutputParser()
        return await chain.ainvoke({"content": content})

    async def score_priority(self, content: str, sender: str) -> dict:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Rate the urgency/priority of this message from 0-100 based on content and sender. Return JSON: 'score' (int), 'reason' (str)."),
            ("user", "Sender: {sender}\nContent: {content}")
        ])
        chain = prompt | self.llm | JsonOutputParser()
        return await chain.ainvoke({"content": content, "sender": sender})

    async def generate_briefing(self, items: list) -> str:
        # Items should be a list of dicts with summary, sender, priority
        item_text = "\n".join([f"- [{item['platform']}] {item['sender']}: {item['summary']} (Priority: {item['priority']})" for item in items])
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful executive assistant. Create a Morning Briefing based on the following high-priority items. Group them logically. Use Markdown."),
            ("user", "{items}")
        ])
        chain = prompt | self.llm | StrOutputParser()
        return await chain.ainvoke({"items": item_text})
