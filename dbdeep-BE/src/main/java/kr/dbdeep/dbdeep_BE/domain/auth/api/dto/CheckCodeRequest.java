package kr.dbdeep.dbdeep_BE.domain.auth.api.dto;

import lombok.Getter;

@Getter
public class CheckCodeRequest {
    private String email;
    private String code;
}
