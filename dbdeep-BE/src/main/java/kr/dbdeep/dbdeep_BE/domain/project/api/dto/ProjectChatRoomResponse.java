package kr.dbdeep.dbdeep_BE.domain.project.api.dto;

import java.time.LocalDateTime;
import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.chat.dto.ChatRoomDto;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.project.entity.Project;
import lombok.Builder;

@Builder
public record ProjectChatRoomResponse(
        Integer id,
        String name,
        String description,
        LocalDateTime createdAt,
        List<ChatRoomDto> chatRooms
) {
    public static ProjectChatRoomResponse from(Project project, List<ChatRoom> chatRooms) {
        return ProjectChatRoomResponse.builder()
                .id(project.getId())
                .name(project.getTitle())
                .description(project.getDescription())
                .createdAt(project.getCreatedAt())
                .chatRooms(chatRooms.stream().map(ChatRoomDto::from).toList())
                .build();
    }
}
