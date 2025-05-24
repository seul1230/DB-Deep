package kr.dbdeep.dbdeep_BE.domain.project.exception;

import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;

public class ChatRoomAlreadyExistsInProjectException extends CommonException {
  public ChatRoomAlreadyExistsInProjectException(ErrorCode errorCode) {
    super(errorCode);
  }
}