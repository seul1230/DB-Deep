package kr.dbdeep.dbdeep_BE.domain.auth.api.dto;

import lombok.Getter;

@Getter
public class SendAuthCodeRequest {
    private String email;
}
