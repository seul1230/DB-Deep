package kr.dbdeep.dbdeep_BE.domain.chat.api.dto;

import java.util.List;
import lombok.Getter;

@Getter
public class ShareChatRequest {
    private List<Integer> targets;
    private String chatId;
}
