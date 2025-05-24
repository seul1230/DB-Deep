import httpx
import asyncio
from typing import Optional, List, AsyncIterator

from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.outputs import GenerationChunk
from langchain_core.language_models.llms import LLM

from config.settings import settings

class GeminiStreamingViaGMS(LLM):
    model_name: str = "gemini-2.0-flash:streamGenerateContent"
    api_key: str = settings.GEMINI_API_KEY
    api_base: str = settings.GEMINI_API_BASE

    n: int = 10  # 텍스트 echo 수

    @property
    def _llm_type(self) -> str:
        return "gemini-streaming-via-gms"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        url = f"{self.api_base}/models/{self.model_name}?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        with httpx.Client(timeout=120.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            return result['candidates'][0]['content']['parts'][0]['text']

    def _stream(self, prompt: str, stop: Optional[List[str]] = None, run_manager: Optional[CallbackManagerForLLMRun] = None):
        for char in prompt[:self.n]:
            chunk = GenerationChunk(text=char)
            if run_manager:
                run_manager.on_llm_new_token(chunk.text, chunk=chunk)
            yield chunk

    async def _astream(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
    ) -> AsyncIterator[GenerationChunk]:
        url = f"{self.api_base}/models/{self.model_name}?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}]
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()

            for chunk in result:
                try:
                    text = chunk["candidates"][0]["content"]["parts"][0]["text"]
                    generation = GenerationChunk(text=text)
                    if run_manager:
                        await run_manager.on_llm_new_token(generation.text, chunk=generation)
                    yield generation
                    await asyncio.sleep(0.2)
                except Exception:
                    continue


class GeminiSyncViaGMS(LLM):
    model_name: str = "gemini-2.0-flash:generateContent"
    api_key: str = settings.GEMINI_API_KEY
    api_base: str = settings.GEMINI_API_BASE

    @property
    def _llm_type(self) -> str:
        return "gemini-sync-via-gms"

    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        url = f"{self.api_base}/models/{self.model_name}?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        }

        with httpx.Client(timeout=60.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()

            try:
                return result['candidates'][0]['content']['parts'][0]['text']
            except Exception as e:
                raise ValueError(f"응답 파싱 오류: {e}\n전체 응답: {result}")


class GeminiEmbeddingViaGMS:
    model_name: str = "text-embedding-004"
    api_key: str = settings.GEMINI_API_KEY
    api_base: str = settings.GEMINI_API_BASE

    def embed_text(self, text: str) -> List[float]:
        url = f"{self.api_base}/models/{self.model_name}:embedContent?key={self.api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "model": self.model_name,
            "content": {
                "parts": [{"text": text}]
            }
        }

        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()

            try:
                return result["embedding"]["values"]
            except Exception as e:
                raise ValueError(f"임베딩 파싱 오류: {e}\n전체 응답: {result}")

    def embed_query(self, text: str) -> List[float]:
        return self.embed_text(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(text) for text in texts]
