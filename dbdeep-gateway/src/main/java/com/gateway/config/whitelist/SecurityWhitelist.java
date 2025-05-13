package com.gateway.config.whitelist;

import java.util.List;

public class SecurityWhitelist {
    public static final List<String> PERMIT_ALL = List.of(
            "/auth/**",
            "/swagger-ui.html",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-resources/**"
    );
}
