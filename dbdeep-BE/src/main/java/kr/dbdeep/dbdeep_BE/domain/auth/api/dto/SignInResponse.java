package kr.dbdeep.dbdeep_BE.domain.auth.api.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignInResponse {
    private String accessToken;
    private String refreshToken;
}
