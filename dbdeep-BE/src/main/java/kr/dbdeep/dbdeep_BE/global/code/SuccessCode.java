package kr.dbdeep.dbdeep_BE.global.code;

import static org.springframework.http.HttpStatus.OK;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    REQUEST_SUCCESS(2000, OK, "요청이 성공적으로 처리되었습니다."),

    ;

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
