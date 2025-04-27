package kr.dbdeep.dbdeep_BE.global.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.Getter;

@Getter
public class CommonException extends RuntimeException {
    private final ErrorCode errorCode;

    public CommonException(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }
}