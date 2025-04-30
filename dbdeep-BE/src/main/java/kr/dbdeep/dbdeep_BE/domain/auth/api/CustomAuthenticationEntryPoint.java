package kr.dbdeep.dbdeep_BE.domain.auth.api;

import static kr.dbdeep.dbdeep_BE.global.config.properties.SecurityWhitelist.PERMIT_ALL;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import kr.dbdeep.dbdeep_BE.domain.auth.filter.AuthExceptionHandlerFilter.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        String path = request.getRequestURI();
        if (isWhitelisted(path)) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 인증되지 않은 사용자에 대한 응답
        ObjectMapper objectMapper = new ObjectMapper();
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("utf-8");
        response.getWriter().write(objectMapper.writeValueAsString(
                new ErrorResponse(HttpStatus.UNAUTHORIZED.value(), "다시 로그인 해주세요")));
    }

    private boolean isWhitelisted(String path) {
        return PERMIT_ALL.stream().anyMatch(pattern -> path.matches(patternToRegex(pattern)));
    }

    private String patternToRegex(String pattern) {
        return pattern.replace("**", ".*");
    }
}


