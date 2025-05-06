package kr.dbdeep.dbdeep_BE.domain.project.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;

public class ProjectNotFoundException extends CommonException {
    public ProjectNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
