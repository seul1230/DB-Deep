package kr.dbdeep.dbdeep_BE.domain.notification.api.dto;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.notification.entity.Notification;
import lombok.Builder;

@Builder
public record NotificationResponse(
        Integer id,
        String memberName,
        String chatName,
        Boolean isRead,
        String chatId,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder().
                id(notification.getId())
                .memberName(notification.getMember().getName())
                .chatName(notification.getChatName())
                .isRead(notification.getIsRead())
                .chatId(notification.getChatroomId())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
