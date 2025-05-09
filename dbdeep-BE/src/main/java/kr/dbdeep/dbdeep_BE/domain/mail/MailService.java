package kr.dbdeep.dbdeep_BE.domain.mail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Random;
import kr.dbdeep.dbdeep_BE.domain.auth.api.dto.CheckCodeRequest;
import kr.dbdeep.dbdeep_BE.domain.auth.application.PasswordGenerator;
import kr.dbdeep.dbdeep_BE.domain.member.application.MemberService;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MailService {

    private String FROM_MAIL = "dbdeep104@gmail.com";

    private static final String EMAIL_CODE_SUBJECT = "[DBDEEP] 이메일 인증 코드 발송";
    private static final String EMAIL_PASSWORD_SUBJECT = "[DBDEEP] 비밀번호 재설정 안내";
    private static final String EMAIL_LOGO_URL = "https://storage.googleapis.com/dbdeep-fe/etc/main_icon.png";
    private static final String EMAIL_CODE_TEMPLATE =
            "<div style=\""
                    + "font-family: 'Segoe UI', Tahoma, sans-serif;"
                    + "max-width: 600px;"
                    + "margin: 0 auto;"
                    + "padding: 30px;"
                    + "border-radius: 16px;"
                    + "background: linear-gradient(135deg, #E0E7FF, #F5F5FF);"
                    + "box-shadow: 0 8px 24px rgba(67, 51, 199, 0.15);"
                    + "\">"
                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "<img src=\"%s\" alt=\"DBDeep Logo\" style=\"width: 100px; height: auto;\"/>"
                    + "</div>"
                    + "<h2 style=\""
                    + "color: #4333C7;"
                    + "text-align: center;"
                    + "margin: 0 0 16px;"
                    + "font-size: 24px;"
                    + "letter-spacing: 1px;"
                    + "\">"
                    + "DBDEEP 이메일 인증"
                    + "</h2>"
                    + "<p style=\""
                    + "color: #4A4A4A;"
                    + "text-align: center;"
                    + "font-size: 16px;"
                    + "margin: 0 0 24px;"
                    + "\">"
                    + "안녕하세요! 아래 인증 코드를 입력하시면 비밀번호 변경이 완료됩니다."
                    + "</p>"
                    + "<div style=\""
                    + "display: block;"
                    + "width: fit-content;"
                    + "margin: 0 auto 24px;"
                    + "padding: 16px 32px;"
                    + "background: #4333C7;"
                    + "border-radius: 8px;"
                    + "color: #fff;"
                    + "font-size: 28px;"
                    + "font-weight: 600;"
                    + "letter-spacing: 2px;"
                    + "box-shadow: 0 4px 12px rgba(67, 51, 199, 0.2);"
                    + "\">"
                    + "%s"
                    + "</div>"
                    + "<p style=\""
                    + "color: #6E78FF;"
                    + "text-align: center;"
                    + "font-size: 14px;"
                    + "margin: 0 0 24px;"
                    + "\">"
                    + "인증 코드를 <strong style=\"color:#4333C7;\">3분</strong> 내에 입력해주세요."
                    + "</p>"
                    + "<hr style=\""
                    + "border: none;"
                    + "border-top: 1px solid #D0D4FF;"
                    + "margin: 32px 0 16px;"
                    + "\"/>"
                    + "<p style=\""
                    + "color: #9A9A9A;"
                    + "font-size: 12px;"
                    + "text-align: center;"
                    + "margin: 0;"
                    + "\">"
                    + "이 이메일을 요청하지 않았다면, 별도의 조치 없이 무시해주세요."
                    + "</p>"
                    + "</div>";
    private static final String EMAIL_PASSWORD_TEMPLATE =
            "<div style=\""
                    + "font-family: 'Segoe UI', Tahoma, sans-serif;"
                    + "max-width: 600px;"
                    + "margin: 0 auto;"
                    + "padding: 30px;"
                    + "border-radius: 16px;"
                    + "background: linear-gradient(135deg, #E0E7FF, #F5F5FF);"
                    + "box-shadow: 0 8px 24px rgba(67, 51, 199, 0.15);"
                    + "\">"
                    + "<div style=\"text-align: center; margin-bottom: 24px;\">"
                    + "<img src=\"%s\" alt=\"DBDeep Logo\" style=\"width: 100px; height: auto;\"/>"
                    + "</div>"
                    + "<h2 style=\""
                    + "color: #4333C7;"
                    + "text-align: center;"
                    + "margin: 0 0 16px;"
                    + "font-size: 24px;"
                    + "letter-spacing: 1px;"
                    + "\">"
                    + "DBDEEP 비밀번호 재설정"
                    + "</h2>"
                    + "<p style=\""
                    + "color: #4A4A4A;"
                    + "text-align: center;"
                    + "font-size: 16px;"
                    + "margin: 0 0 24px;"
                    + "\">"
                    + "안녕하세요! 아래 변경된 비밀번호로 로그인 해주세요."
                    + "</p>"
                    + "<div style=\""
                    + "display: block;"
                    + "width: fit-content;"
                    + "margin: 0 auto 24px;"
                    + "padding: 16px 32px;"
                    + "background: #4333C7;"
                    + "border-radius: 8px;"
                    + "color: #fff;"
                    + "font-size: 28px;"
                    + "font-weight: 600;"
                    + "letter-spacing: 2px;"
                    + "box-shadow: 0 4px 12px rgba(67, 51, 199, 0.2);"
                    + "\">"
                    + "%s"
                    + "</div>"
                    + "<p style=\""
                    + "color: #6E78FF;"
                    + "text-align: center;"
                    + "font-size: 14px;"
                    + "margin: 0 0 24px;"
                    + "\">"
                    + "로그인 후 비밀번호를 <strong style=\"color:#4333C7;\">재설정</strong> 해주세요."
                    + "</p>"
                    + "<hr style=\""
                    + "border: none;"
                    + "border-top: 1px solid #D0D4FF;"
                    + "margin: 32px 0 16px;"
                    + "\"/>"
                    + "<p style=\""
                    + "color: #9A9A9A;"
                    + "font-size: 12px;"
                    + "text-align: center;"
                    + "margin: 0;"
                    + "\">"
                    + "이 이메일을 요청하지 않았다면, 별도의 조치 없이 무시해주세요."
                    + "</p>"
                    + "</div>";

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final AuthCodeRepository authCodeRepository;

    public void sendAuthenticationCode(String email) {
        String randomCode = generateRandomCode();

        String content = String.format(EMAIL_CODE_TEMPLATE, EMAIL_LOGO_URL, randomCode);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, "utf-8");
            messageHelper.setFrom(FROM_MAIL);
            messageHelper.setTo(email);
            messageHelper.setSubject(EMAIL_CODE_SUBJECT);
            messageHelper.setText(content, true);

            mailSender.send(message);
            authCodeRepository.save(email, randomCode);
        } catch (MailSendException e) {
            throw new CommonException(ErrorCode.MAIL_SEND_ERROR);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void checkAuthCode(CheckCodeRequest request) {
        String storedCode = authCodeRepository.findCodeByEmailAndRandomCode(request.getEmail());
        if (storedCode == null || !storedCode.equals(request.getCode())) {
            throw new CommonException(ErrorCode.INVALID_AUTH_CODE);
        }
        Member member = memberService.findByEmail(request.getEmail());
        String newPassword = PasswordGenerator.generate(12);
        sendNewPasswordEmail(request.getEmail(), newPassword);
        member.resetPassword(passwordEncoder.encode(newPassword));
    }

    public void sendNewPasswordEmail(String email, String newPassword) {
        String content = String.format(EMAIL_PASSWORD_TEMPLATE, EMAIL_LOGO_URL, newPassword);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, "utf-8");
            messageHelper.setFrom(FROM_MAIL);
            messageHelper.setTo(email);
            messageHelper.setSubject(EMAIL_PASSWORD_SUBJECT);
            messageHelper.setText(content, true);

            mailSender.send(message);
        } catch (MailSendException e) {
            throw new CommonException(ErrorCode.MAIL_SEND_ERROR);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    private String generateRandomCode() {
        Random random = new Random();
        int n = random.nextInt(1000000);
        return String.format("%06d", n);
    }

}
