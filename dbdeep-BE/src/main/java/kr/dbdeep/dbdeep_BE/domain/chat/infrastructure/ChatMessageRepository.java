package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.Query.Direction;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import java.util.List;
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
                            .content(doc.getString("content"))
                            .memberId(doc.getLong("sender_id"))
                            .senderType(doc.getString("sender_type"))
                            .timestamp(doc.getTimestamp("timestamp"))
                            .build())
                    .toList();

        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Firestore 데이터 에러", e);
        }
    }
}
