#!/bin/sh

# Elasticsearch가 뜰 때까지 대기
echo "⏳ Waiting for Elasticsearch..."
sleep 10

# 인덱스가 이미 존재하는지 확인
echo "🔍 Checking if index exists..."
if curl -s -o /dev/null -w "%{http_code}" http://elasticsearch:9200/chat-messages | grep -q "200"; then
  echo "✅ Index already exists. Skipping creation."
else
  echo "🛠️ Creating index with mapping..."
  curl -X PUT "http://elasticsearch:9200/chat-messages" -H 'Content-Type: application/json' -d '
  {
    "mappings": {
      "properties": {
        "chatRoomId": { "type": "keyword" },
        "content":    { "type": "text" },
        "memberId":   { "type": "integer" },
        "senderType": { "type": "keyword" },
        "timestamp":  { "type": "date" }
      }
    }
  }'
fi
