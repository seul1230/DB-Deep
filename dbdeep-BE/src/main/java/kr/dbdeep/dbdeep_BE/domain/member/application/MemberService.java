package kr.dbdeep.dbdeep_BE.domain.member.application;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.member.dto.MemberDto;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import kr.dbdeep.dbdeep_BE.domain.member.infrastructure.MemberRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;

    public List<MemberDto> findAll() {
        return memberRepository.findAllByDeletedAtIsNull()
                .stream()
                .map(MemberDto::from)
                .toList();
    }

    public Member findById(Integer id) {
        return memberRepository.findById(id).orElseThrow(() -> new CommonException(ErrorCode.MEMBER_NOT_FOUND));
    }

    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email).orElseThrow(() -> new CommonException(ErrorCode.MEMBER_NOT_FOUND));
    }

}
