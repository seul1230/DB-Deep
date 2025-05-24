package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.ChatRoomListResponse;

public interface ChatRoomQueryRepository {
    ChatRoomListResponse findByCursor(Integer memberId, LocalDateTime cursor, int pageSize);
}
