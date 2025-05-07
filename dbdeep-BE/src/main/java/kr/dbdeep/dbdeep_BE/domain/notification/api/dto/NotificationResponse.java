package kr.dbdeep.dbdeep_BE.domain.notification.api.dto;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.notification.entity.Notification;

public record NotificationResponse(
        Integer id,
        String content,
        Boolean isRead,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getContent(),
                notification.getIsRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
