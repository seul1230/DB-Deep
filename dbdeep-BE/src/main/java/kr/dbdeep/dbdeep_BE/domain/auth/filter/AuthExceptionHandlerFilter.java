package kr.dbdeep.dbdeep_BE.domain.auth.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.Data;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

public class AuthExceptionHandlerFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException | MalformedJwtException e) {
            //토큰의 유효기간 만료
            setErrorResponse(response, ErrorCode.EXPIRED_TOKEN);
        } catch (SecurityException e) {
            setErrorResponse(response, ErrorCode.INVALID_TOKEN);
        } catch (JwtException | IllegalArgumentException e) {
            //유효하지 않은 토큰
            setErrorResponse(response, ErrorCode.INVALID_TOKEN);
        }
    }

    private void setErrorResponse(HttpServletResponse response, ErrorCode errorCode) {
        ObjectMapper objectMapper = new ObjectMapper();
        response.setStatus(errorCode.getHttpStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=utf-8");
        ErrorResponse errorResponse = new ErrorResponse(errorCode.getHttpStatus().value(), errorCode.getMessage());
        try {
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Data
    public static class ErrorResponse {
        private final Integer code;
        private final String message;
    }

}
