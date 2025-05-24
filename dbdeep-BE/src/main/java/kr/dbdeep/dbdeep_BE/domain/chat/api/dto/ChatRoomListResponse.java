package kr.dbdeep.dbdeep_BE.domain.chat.api.dto;

import java.time.LocalDateTime;
import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.chat.dto.ChatRoomDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatRoomListResponse {
    private List<ChatRoomDto> chatRooms;
    private LocalDateTime nextCursor;
    private boolean hasNext;
}

