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

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final AuthCodeRepository authCodeRepository;

    public void sendAuthenticationCode(String subject, String email) {
        String toMail = email;
        String randomCode = generateRandomCode();
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, "utf-8");
            messageHelper.setFrom(FROM_MAIL);
            messageHelper.setTo(toMail);
            messageHelper.setSubject(subject);
            messageHelper.setText(randomCode);

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
        sendNewPasswordEmail("새 비밀번호 안내", request.getEmail(), newPassword);
        member.resetPassword(passwordEncoder.encode(newPassword));
    }

    public void sendNewPasswordEmail(String subject, String email, String newPassword) {
        String toMail = email;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper messageHelper = new MimeMessageHelper(message, true, "utf-8");
            messageHelper.setFrom(FROM_MAIL);
            messageHelper.setTo(toMail);
            messageHelper.setSubject(subject);
            messageHelper.setText(newPassword);

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
