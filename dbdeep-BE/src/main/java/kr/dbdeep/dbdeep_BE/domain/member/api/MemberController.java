package kr.dbdeep.dbdeep_BE.domain.member.api;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.member.api.dto.MemberInfoResponse;
import kr.dbdeep.dbdeep_BE.domain.member.application.MemberService;
import kr.dbdeep.dbdeep_BE.domain.member.dto.MemberDto;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public JSONResponse<?> findAllMembers() {
        List<MemberDto> members = memberService.findAll();
        return JSONResponse.onSuccess(MemberInfoResponse.builder().members(members).build());
    }

}
