package kr.dbdeep.dbdeep_BE.domain.auth.application;

import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignInRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignInResponse;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignUpRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.UpdatePasswordRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.dto.ProfileDto;
import kr.dbdeep.dbdeep_BE.domain.auth.dto.TokenDto;
import kr.dbdeep.dbdeep_BE.domain.member.application.MemberService;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import kr.dbdeep.dbdeep_BE.domain.member.exception.MemberNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.member.infrastructure.MemberRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final MemberService memberService;

    public SignInResponse signIn(SignInRequest request) {
        Member member = memberService.findByEmail(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new MemberNotFoundException(ErrorCode.INVALID_SIGN_IN);
        }

        TokenDto tokenDto = jwtProvider.generateAuthenticationTokens(member);
        ProfileDto profileDto = ProfileDto.from(member);

        return SignInResponse.builder()
                .tokens(tokenDto)
                .profile(profileDto)
                .build();
    }

    @Transactional
    public void signUp(SignUpRequest request) {
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        memberRepository.save(member);
    }

    @Transactional
    public void changePassword(Integer memberId, UpdatePasswordRequest request) {
        Member member = memberService.findById(memberId);
        if (!passwordEncoder.matches(request.password(), member.getPassword())) {
            throw new CommonException(ErrorCode.WRONG_PASSWORD);
        }
        member.updatePassword(passwordEncoder.encode(request.newPassword()));
    }

}
