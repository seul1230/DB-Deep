package kr.dbdeep.dbdeep_BE.domain.auth.api.dto;

import kr.dbdeep.dbdeep_BE.domain.auth.dto.ProfileDto;
import kr.dbdeep.dbdeep_BE.domain.auth.dto.TokenDto;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SignInResponse {
    private TokenDto tokens;
    private ProfileDto profile;
}
