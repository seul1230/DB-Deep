package kr.dbdeep.dbdeep_BE.global.exception;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

import java.util.List;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;


@Slf4j
@RestControllerAdvice
public class CommonExceptionHandler {
    // Valid 실패 시 발생하는 예외
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<JSONResponse<Object>> handleMethodArgumentNotValidException(
            final MethodArgumentNotValidException e) {
        List<FieldError> fieldErrors = e.getBindingResult().getFieldErrors();
        log.error(e.getMessage(), e);

        return ResponseEntity
                .status(BAD_REQUEST)
                .body(JSONResponse.onFailure(ErrorCode.INVALID_REQUEST, fieldErrors.get(0).getDefaultMessage()));
    }

    // @PathVariable 잘못 입력 또는 요청 메시지 바디에 아무 값도 전달되지 않았을 때
    @ExceptionHandler({MethodArgumentTypeMismatchException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<JSONResponse<Object>> handlerMethodArgumentTypeMismatchException(final Exception e) {
        log.error(e.getMessage(), e);
        return ResponseEntity
                .status(BAD_REQUEST)
                .body(JSONResponse.onFailure(ErrorCode.INVALID_REQUEST));
    }

    // 존재하지 않는 엔드포인트 요청 시 404 처리
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<JSONResponse<Object>> handleNotFoundException(final NoHandlerFoundException e) {
        log.error("MethodArgumentNotValidException 발생", e);
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(JSONResponse.onFailure(ErrorCode.INVALID_REQUEST));
    }

    // 그 외 CommonException 상속받은 모든 예외를 이 메소드에서 처리
    @ExceptionHandler(CommonException.class)
    public ResponseEntity<JSONResponse<Object>> handlerCommonException(final CommonException e) {
        log.error("Exception = {}, code = {}, message = {}", e.getClass(), e.getErrorCode(),
                e.getErrorCode().getMessage());
        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(JSONResponse.onFailure(e.getErrorCode()));
    }

    // 서버 내부 오류 (SQL 연결 오류 등) 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<JSONResponse<Object>> handlerException(final Exception e) {
        log.error("Unexpected error occurred", e);
        return ResponseEntity
                .status(INTERNAL_SERVER_ERROR)
                .body(JSONResponse.onFailure(ErrorCode.SERVER_ERROR));
    }
}