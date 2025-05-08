package kr.dbdeep.dbdeep_BE.domain.auth.application;

import java.util.Collections;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignInRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignInResponse;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignUpRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.UpdatePasswordRequest;
import kr.dbdeep.dbdeep_BE.domain.member.application.MemberService;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import kr.dbdeep.dbdeep_BE.domain.member.exception.MemberNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.member.infrastructure.MemberRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
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
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new MemberNotFoundException(ErrorCode.INVALID_SIGN_IN));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new MemberNotFoundException(ErrorCode.INVALID_SIGN_IN);
        }

        Authentication authentication = authenticate(member);
        String accessToken = jwtProvider.generateAccessToken(authentication);
        String refreshToken = jwtProvider.generateRefreshToken(authentication);

        return SignInResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
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

    private Authentication authenticate(Member member) {
        User user = new User(
                String.valueOf(member.getId()),
                "",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + member.getType().name()))
        );
        return new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
    }

}
