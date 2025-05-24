package kr.dbdeep.dbdeep_BE.domain.member.api.dto;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.member.dto.MemberDto;
import lombok.Builder;

@Builder
public record MemberInfoResponse(
        List<MemberDto> members
) {
    public static MemberInfoResponse from(List<MemberDto> members) {
        return MemberInfoResponse.builder()
                .members(members)
                .build();
    }
}
