FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python - <<EOF
from transformers import AutoTokenizer, AutoModel
AutoTokenizer.from_pretrained("eenzeenee/t5-base-korean-summarization", use_auth_token=True)
AutoModel.from_pretrained("eenzeenee/t5-base-korean-summarization", use_auth_token=True)
EOF

COPY . .

EXPOSE 8080

ENV PORT 8080
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 100"]