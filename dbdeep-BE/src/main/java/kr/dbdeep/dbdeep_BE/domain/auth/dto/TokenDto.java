package kr.dbdeep.dbdeep_BE.domain.auth.dto;

import lombok.Builder;

@Builder
public record TokenDto(
        String accessToken,
        String refreshToken
) {
}
