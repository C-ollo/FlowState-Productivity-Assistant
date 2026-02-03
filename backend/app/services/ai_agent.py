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
