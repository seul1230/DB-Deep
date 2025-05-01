package kr.dbdeep.dbdeep_BE.domain.auth.api;

import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignInRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignInResponse;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.SignUpRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.application.AuthService;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signin")
    public JSONResponse<SignInResponse> signIn(@RequestBody SignInRequest signInRequest) {
        SignInResponse signInResponse = authService.signIn(signInRequest);
        return JSONResponse.onSuccess(signInResponse);
    }

    @PostMapping("/signup")
    public void signUp(@RequestBody SignUpRequest signUpRequest) {
        authService.signUp(signUpRequest);
    }

}
