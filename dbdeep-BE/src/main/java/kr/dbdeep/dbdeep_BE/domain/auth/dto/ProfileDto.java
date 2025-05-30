package kr.dbdeep.dbdeep_BE.domain.auth.dto;

import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import lombok.Builder;

@Builder
public record ProfileDto(
        String name,
        Integer memberId,
        String email,
        String imageUrl,
        String teamName,
        Boolean passwordNotChanged
) {

    public static ProfileDto from(Member member) {
        return ProfileDto.builder()
                .email(member.getEmail())
                .memberId(member.getId())
                .name(member.getName())
                .imageUrl(member.getProfileImage())
                .teamName(member.getDepartment().getName())
                .passwordNotChanged(member.getPasswordNotChanged())
                .build();
    }

}
