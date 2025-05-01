package kr.dbdeep.dbdeep_BE.domain.chat.api.dto;

import lombok.Getter;

@Getter
public class AllowShareChatRequest {
    private Integer notificationId;
    private Boolean accepted;
}
