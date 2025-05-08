package kr.dbdeep.dbdeep_BE.domain.auth.api.dto;

public record UpdatePasswordRequest(
        String password,
        String newPassword
) {

}
