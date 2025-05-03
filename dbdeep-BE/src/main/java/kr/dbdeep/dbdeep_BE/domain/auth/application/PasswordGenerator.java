package kr.dbdeep.dbdeep_BE.domain.auth.application;

import java.security.SecureRandom;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordGenerator {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%^&*()-_+=<>?";
    private static final String ALL = UPPER + LOWER + DIGITS + SPECIAL;

    private static final SecureRandom random = new SecureRandom();

    public static String generate(int length) {
        if (length < 8) {
            throw new IllegalArgumentException("비밀번호는 최소 8자리 이상이어야 합니다.");
        }

        StringBuilder password = new StringBuilder(length);

        // 필수 조건: 최소 1개씩 포함
        password.append(getRandomChar(UPPER));
        password.append(getRandomChar(LOWER));
        password.append(getRandomChar(DIGITS));
        password.append(getRandomChar(SPECIAL));

        // 나머지 채우기
        for (int i = 4; i < length; i++) {
            password.append(getRandomChar(ALL));
        }

        // 셔플
        return shuffleString(password.toString());
    }

    private static char getRandomChar(String chars) {
        return chars.charAt(random.nextInt(chars.length()));
    }

    private static String shuffleString(String input) {
        char[] chars = input.toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            // swap
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }
        return new String(chars);
    }
}

