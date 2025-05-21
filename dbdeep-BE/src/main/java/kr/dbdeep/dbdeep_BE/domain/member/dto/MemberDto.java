package kr.dbdeep.dbdeep_BE.domain.member.dto;

import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import lombok.Builder;

@Builder
public record MemberDto(
        Integer id,
        String name,
        String email,
        String profileImage,
        String teamName
) {
    public static MemberDto from(Member member) {
        return MemberDto.builder()
                .id(member.getId())
                .name(member.getName())
                .email(member.getEmail())
                .profileImage(member.getProfileImage())
                .teamName(member.getDepartment().getName())
                .build();
    }
}
