package kr.dbdeep.dbdeep_BE.domain.notification.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;

public class NotificationException extends CommonException {
    public NotificationException(ErrorCode errorCode) {
        super(errorCode);
    }
}
