package kr.dbdeep.dbdeep_BE.domain.archive.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;

public class ArchiveNotFoundException extends CommonException {
    public ArchiveNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
