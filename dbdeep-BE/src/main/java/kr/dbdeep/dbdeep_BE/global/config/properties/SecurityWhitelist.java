package kr.dbdeep.dbdeep_BE.global.config.properties;


import java.util.List;

public class SecurityWhitelist {
    public static final List<String> PERMIT_ALL = List.of(
            "/auth/**"
    );
}