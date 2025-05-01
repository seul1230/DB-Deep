package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure;

import com.querydsl.jpa.impl.JPAQueryFactory;
import java.time.LocalDateTime;
import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.dto.ChatRoomDto;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.QChatRoom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatRoomQueryRepositoryImpl implements ChatRoomQueryRepository {

    private final JPAQueryFactory queryFactory;

    @Override
    public ChatRoomListResponse findChatRoomsByCursor(Integer memberId, LocalDateTime cursor, int pageSize) {
        QChatRoom chatRoom = QChatRoom.chatRoom;

        List<ChatRoom> results = queryFactory
                .selectFrom(chatRoom)
                .where(
                        chatRoom.memberId.eq(memberId),
                        cursor != null ? chatRoom.lastMessageAt.lt(cursor) : null,
                        chatRoom.deletedAt.isNull()
                )
                .orderBy(chatRoom.lastMessageAt.desc())
                .limit(pageSize + 1)
                .fetch();

        boolean hasNext = results.size() > pageSize;

        if (hasNext) {
            results.remove(pageSize);
        }

        List<ChatRoomDto> chatRooms = results.stream()
                .map(ChatRoomDto::from)
                .toList();

        LocalDateTime nextCursor = hasNext
                ? results.get(results.size() - 1).getLastMessageAt()
                : null;

        return ChatRoomListResponse.builder()
                .chatRooms(chatRooms)
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .build();
    }
}

