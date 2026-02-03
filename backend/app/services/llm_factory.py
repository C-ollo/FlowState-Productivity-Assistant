from typing import Optional
from langchain_core.language_models.chat_models import BaseChatModel
from app.core.config import settings

class LLMFactory:
    @staticmethod
    def create_llm() -> BaseChatModel:
        provider = settings.LLM_PROVIDER.lower()
        
        if provider == "anthropic":
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(
                api_key=settings.ANTHROPIC_API_KEY,
                model_name="claude-3-opus-20240229", # Or use lighter model
                temperature=0
            )
        
        elif provider == "openai":
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                api_key=settings.OPENAI_API_KEY,
                model_name="gpt-4o",
                temperature=0
            )
            
        elif provider == "ollama":
            from langchain_community.chat_models import ChatOllama
            return ChatOllama(
                base_url=settings.OLLAMA_BASE_URL,
                model="llama3",
                temperature=0
            )
            
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")
