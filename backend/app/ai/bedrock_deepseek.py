"""Custom LangChain wrapper for DeepSeek models on AWS Bedrock."""

import json
from typing import Any, Iterator, List, Optional

import boto3
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.outputs import ChatGeneration, ChatResult


class ChatBedrockDeepSeek(BaseChatModel):
    """Chat model for DeepSeek on AWS Bedrock.

    DeepSeek models on Bedrock use OpenAI-compatible message format.
    """

    client: Any = None
    model_id: str = "deepseek.v3.2"
    temperature: float = 0
    max_tokens: int = 1024
    region_name: str = "us-east-1"
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_session_token: Optional[str] = None

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)

        # Create boto3 client
        client_kwargs = {"region_name": self.region_name}
        if self.aws_access_key_id:
            client_kwargs["aws_access_key_id"] = self.aws_access_key_id
        if self.aws_secret_access_key:
            client_kwargs["aws_secret_access_key"] = self.aws_secret_access_key
        if self.aws_session_token:
            client_kwargs["aws_session_token"] = self.aws_session_token

        self.client = boto3.client("bedrock-runtime", **client_kwargs)

    @property
    def _llm_type(self) -> str:
        return "bedrock-deepseek"

    def _convert_messages(self, messages: List[BaseMessage]) -> List[dict]:
        """Convert LangChain messages to DeepSeek format."""
        result = []
        for msg in messages:
            if isinstance(msg, SystemMessage):
                result.append({"role": "system", "content": msg.content})
            elif isinstance(msg, HumanMessage):
                result.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AIMessage):
                result.append({"role": "assistant", "content": msg.content})
            else:
                result.append({"role": "user", "content": str(msg.content)})
        return result

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Generate a response from DeepSeek on Bedrock."""

        converted_messages = self._convert_messages(messages)

        request_body = {
            "messages": converted_messages,
            "max_tokens": kwargs.get("max_tokens", self.max_tokens),
            "temperature": kwargs.get("temperature", self.temperature),
        }

        if stop:
            request_body["stop"] = stop

        response = self.client.invoke_model(
            modelId=self.model_id,
            body=json.dumps(request_body),
        )

        response_body = json.loads(response["body"].read())

        content = response_body["choices"][0]["message"]["content"]

        message = AIMessage(content=content)
        generation = ChatGeneration(message=message)

        return ChatResult(generations=[generation])

    @property
    def _identifying_params(self) -> dict:
        return {
            "model_id": self.model_id,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
