package kr.dbdeep.dbdeep_BE.domain.auth.api.dto;

import lombok.Getter;

@Getter
public class SignInRequest {
    private String email;
    private String password;
}
