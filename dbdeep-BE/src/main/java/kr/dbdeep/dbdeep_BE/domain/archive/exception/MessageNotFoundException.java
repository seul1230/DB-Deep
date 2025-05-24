package kr.dbdeep.dbdeep_BE.domain.archive.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;

public class MessageNotFoundException extends CommonException {
    public MessageNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
