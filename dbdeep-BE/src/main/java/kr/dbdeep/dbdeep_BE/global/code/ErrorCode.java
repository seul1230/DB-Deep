package kr.dbdeep.dbdeep_BE.global.code;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 서버 에러
    SERVER_ERROR(5000, INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    NOT_FOUND(4000, HttpStatus.NOT_FOUND, "요청한 경로를 찾을 수 없습니다"),


    // 요청 에러
    INVALID_REQUEST(4000, BAD_REQUEST, "잘못된 요청 형식입니다"),

    // 인증, 토큰에러
    INVALID_SIGN_IN(4040, HttpStatus.NOT_FOUND, "이메일 혹은 비밀번호가 틀립니다"),
    EXPIRED_TOKEN(4010, UNAUTHORIZED, "만료된 토큰입니다"),
    INVALID_TOKEN(4010, UNAUTHORIZED, "유효하지 않은 토큰입니다"),

    // 채팅 에러
    CHAT_ROOM_NOT_FOUND(4040, HttpStatus.NOT_FOUND, "찾을 수 없는 채팅방입니다"),

    // 멤버 에러
    MEMBER__NOT_FOUND(4040, HttpStatus.NOT_FOUND, "찾을 수 없는 유저입니다"),

    // 알림 에러
    NOTIFICATION_NOT_FOUND(4040, HttpStatus.NOT_FOUND, "찾을 수 없는 알림입니다");
    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
