package kr.dbdeep.dbdeep_BE.domain.archive.api.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public record ArchivedMessageResponse(
        Integer archiveId,
        String messageId,
        String lastMessage,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime chatSentAt,

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime archivedAt
) {
    public static ArchivedMessageResponse from(
            Integer archiveId,
            String messageId,
            String lastMessage,
            LocalDateTime chatSentAt,
            LocalDateTime archivedAt
    ) {
        return new ArchivedMessageResponse(archiveId, messageId, lastMessage, chatSentAt, archivedAt);
    }
}
