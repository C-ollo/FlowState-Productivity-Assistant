from functools import lru_cache

from langchain_core.language_models import BaseChatModel

from app.config import settings


@lru_cache
def get_llm() -> BaseChatModel:
    """Get the configured LLM instance."""
    if settings.llm_provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model="claude-3-haiku-20240307",
            api_key=settings.anthropic_api_key,
            temperature=0,
            max_tokens=1024,
        )
    elif settings.llm_provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model="gpt-4o-mini",
            api_key=settings.openai_api_key,
            temperature=0,
            max_tokens=1024,
        )
    elif settings.llm_provider == "ollama":
        from langchain_community.chat_models import ChatOllama

        return ChatOllama(
            model="llama3.1",
            base_url=settings.ollama_base_url,
            temperature=0,
        )
    else:
        raise ValueError(f"Unknown LLM provider: {settings.llm_provider}")


def get_llm_for_briefing() -> BaseChatModel:
    """Get a higher-capacity LLM for briefing generation."""
    if settings.llm_provider == "anthropic":
        from langchain_anthropic import ChatAnthropic

        return ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=settings.anthropic_api_key,
            temperature=0.3,
            max_tokens=2048,
        )
    elif settings.llm_provider == "openai":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model="gpt-4o",
            api_key=settings.openai_api_key,
            temperature=0.3,
            max_tokens=2048,
        )
    else:
        return get_llm()
