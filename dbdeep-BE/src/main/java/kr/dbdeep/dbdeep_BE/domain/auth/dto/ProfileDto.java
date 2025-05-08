package kr.dbdeep.dbdeep_BE.domain.auth.dto;

import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import lombok.Builder;

@Builder
public record ProfileDto(
        String email,
        String imageUrl,
        Boolean passwordNotChanged
) {

    public static ProfileDto from(Member member) {
        return ProfileDto.builder()
                .email(member.getEmail())
                .imageUrl(member.getProfileImage())
                .passwordNotChanged(member.getPasswordNotChanged())
                .build();
    }

}
