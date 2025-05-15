FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ARG HUGGINGFACE_HUB_TOKEN
ENV HUGGINGFACE_HUB_TOKEN=${HUGGINGFACE_HUB_TOKEN}

RUN python - <<EOF
import os
from transformers import AutoTokenizer, AutoModel
token = os.getenv("HUGGINGFACE_HUB_TOKEN")
AutoTokenizer.from_pretrained("eenzeenee/t5-base-korean-summarization", use_auth_token=token)
AutoModel.from_pretrained("eenzeenee/t5-base-korean-summarization", use_auth_token=token)
EOF

COPY . .

EXPOSE 8080

ENV PORT 8080
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 100"]
