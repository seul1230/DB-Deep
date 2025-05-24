package kr.dbdeep.dbdeep_BE.domain.chat.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;

public class ChatRoomNotFoundException extends CommonException {
    public ChatRoomNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
