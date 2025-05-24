package kr.dbdeep.dbdeep_BE.global.config;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.auth.resolver.CurrentMemberIdArgumentResolver;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final CurrentMemberIdArgumentResolver currentMemberIdArgumentResolver;

    public WebConfig(CurrentMemberIdArgumentResolver resolver) {
        this.currentMemberIdArgumentResolver = resolver;
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentMemberIdArgumentResolver);
    }
}
