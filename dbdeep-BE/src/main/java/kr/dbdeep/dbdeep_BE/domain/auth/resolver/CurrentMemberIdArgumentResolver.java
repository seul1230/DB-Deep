package kr.dbdeep.dbdeep_BE.domain.auth.resolver;

import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentMemberIdArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentMemberId.class)
                && parameter.getParameterType().equals(Integer.class);
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        String memberIdHeader = webRequest.getHeader("X-Member-Id");
        if (memberIdHeader == null) {
            throw new IllegalStateException("X-Member-Id 헤더가 없습니다.");
        }

        try {
            return Integer.parseInt(memberIdHeader);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("X-Member-Id 값이 정수가 아닙니다.", e);
        }
    }
}
