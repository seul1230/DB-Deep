import os
import time
import httpx
import asyncio
from dotenv import load_dotenv

from typing import Optional, List, AsyncIterator
from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.outputs import GenerationChunk
from langchain_core.language_models.llms import LLM

class GeminiStreamingViaGMS(LLM):
    model_name: str = "gemini-2.0-flash:streamGenerateContent"
    api_key: str = ""
    api_base: str = "https://gms.p.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta"
    
    n: int = 10
    """The number of characters from the last message of the prompt to be echoed."""

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
        timeout = httpx.Timeout(120.0)
        with httpx.Client(timeout=timeout) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            text = result['candidates'][0]['content']['parts'][0]['text']
            return text
        
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
    api_key: str = ""
    api_base: str = "https://gms.p.ssafy.io/gmsapi/generativelanguage.googleapis.com/v1beta"

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
        timeout = httpx.Timeout(60.0)
        with httpx.Client(timeout=timeout) as client:
            response = client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()

            try:
                return result['candidates'][0]['content']['parts'][0]['text']
            except Exception as e:
                raise ValueError(f"응답 파싱 오류: {e}\n전체 응답: {result}")