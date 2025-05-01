package kr.dbdeep.dbdeep_BE.domain.member.application;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.member.dto.MemberDto;
import kr.dbdeep.dbdeep_BE.domain.member.infrastructure.MemberRepository;
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

}
