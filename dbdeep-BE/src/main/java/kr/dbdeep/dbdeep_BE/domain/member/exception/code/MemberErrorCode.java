package kr.dbdeep.dbdeep_BE.domain.member.exception.code;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum MemberErrorCode {


    ;

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
