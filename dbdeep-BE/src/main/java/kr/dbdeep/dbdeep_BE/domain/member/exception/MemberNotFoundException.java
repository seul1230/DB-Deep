package kr.dbdeep.dbdeep_BE.domain.member.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;

public class MemberNotFoundException extends CommonException {
    public MemberNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
