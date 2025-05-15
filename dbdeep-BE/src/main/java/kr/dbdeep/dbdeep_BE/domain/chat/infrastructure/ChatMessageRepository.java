package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure;

import com.google.cloud.Timestamp;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.Query.Direction;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatMessageRepository {

    private final Firestore firestore;

    public List<ChatMessage> findRecentMessagesByChatRoomId(String chatRoomId) {
        try {
            Query query = firestore.collection("chat_messages")
                    .whereEqualTo("chat_room_id", chatRoomId)
                    .orderBy("timestamp", Direction.DESCENDING);

            List<QueryDocumentSnapshot> docs = query.get().get().getDocuments();

            return docs.stream()
                    .map(doc -> ChatMessage.builder()
                            .id(doc.getId())
                            .chatRoomId(doc.getString("chat_room_id"))
                            .content(doc.get("content"))
                            .senderType(doc.getString("sender_type"))
                            .timestamp(doc.getTimestamp("timestamp"))
                            .build())
                    .toList();

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Firestore 데이터 에러", e);
        }
    }

    public List<ChatMessage> findMessagesBeforeTimestamp(String chatRoomId, Timestamp before) {
        try {
            Query query = firestore.collection("chat_messages")
                    .whereEqualTo("chat_room_id", chatRoomId)
                    .whereLessThan("timestamp", before)
                    .orderBy("timestamp", Direction.DESCENDING);

            List<QueryDocumentSnapshot> docs = query.get().get().getDocuments();

            return docs.stream()
                    .map(doc -> ChatMessage.builder()
                            .id(doc.getId())
                            .chatRoomId(doc.getString("chat_room_id"))
                            .content(doc.get("content"))
                            .senderType(doc.getString("sender_type"))
                            .timestamp(doc.getTimestamp("timestamp"))
                            .build())
                    .toList();

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Firestore 쿼리 실패", e);
        }
    }

    public ChatMessage findById(String messageId) {
        try {
            DocumentSnapshot doc = firestore.collection("chat_messages")
                    .document(messageId)
                    .get()
                    .get();

            return ChatMessage.builder()
                    .id(doc.getId())
                    .chatRoomId(doc.getString("chat_room_id"))
                    .content(doc.get("content"))
                    .senderType(doc.getString("sender_type"))
                    .timestamp(doc.getTimestamp("timestamp"))
                    .build();

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Firestore 쿼리 실패", e);
        }
    }


    public void saveAll(List<ChatMessage> messages) {
        var batch = firestore.batch();

        for (ChatMessage message : messages) {
            batch.set(
                    firestore.collection("chat_messages").document(message.getId()),
                    Map.of(
                            "chat_room_id", message.getChatRoomId(),
                            "content", message.getContent(),
                            "sender_type", message.getSenderType(),
                            "timestamp", message.getTimestamp()
                    )
            );
        }

        try {
            batch.commit().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Firestore 저장 중 오류 발생", e);
        }
    }

}
