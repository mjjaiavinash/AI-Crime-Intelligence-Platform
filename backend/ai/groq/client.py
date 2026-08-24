from typing import Generator, List, Dict, Any
from groq import Groq
from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


class GroqClientManager:
    _client: Groq = None

    @classmethod
    def get_client(cls) -> Groq:
        if cls._client is None:
            if not settings.GROQ_API_KEY:
                logger.error("GROQ_API_KEY is not configured in settings!")
                raise ValueError("GROQ_API_KEY is not configured")
            logger.info("Initializing Groq client...")
            cls._client = Groq(api_key=settings.GROQ_API_KEY)
        return cls._client

    @classmethod
    def generate_completion(
        cls,
        prompt: str,
        system_prompt: str = "You are a helpful assistant.",
        model: str = None,
        temperature: float = 0.2,
    ) -> str:
        """Non-streaming prompt completion helper."""
        if model is None:
            model = settings.GROQ_MODEL
        try:
            client = cls.get_client()
            logger.info("Sending chat completion to Groq (model=%s)...", model)
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                model=model,
                temperature=temperature,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error("Failed to generate completion from Groq: %s", e)
            return f"Error communicating with LLM provider: {e}"

    @classmethod
    def generate_streaming_completion(
        cls,
        messages: List[Dict[str, str]],
        model: str = None,
        temperature: float = 0.2,
    ) -> Generator[str, None, None]:
        """Streaming chat completions helper yielding token strings."""
        if model is None:
            model = settings.GROQ_MODEL
        try:
            client = cls.get_client()
            logger.info("Initiating Groq chat stream (model=%s)...", model)
            response = client.chat.completions.create(
                messages=messages,
                model=model,
                temperature=temperature,
                stream=True,
            )
        except Exception as e:
            logger.error("Error initiating Groq stream: %s", e)
            yield f"Sorry, I could not connect to the AI service. Error: {e}"
            return

        try:
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            logger.error("Error reading Groq stream chunks: %s", e)
            yield f"\n\nSorry, the response was interrupted. Please try again."
