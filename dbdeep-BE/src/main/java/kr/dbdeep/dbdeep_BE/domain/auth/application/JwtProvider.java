package kr.dbdeep.dbdeep_BE.domain.auth.application;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.stream.Collectors;
import kr.dbdeep.dbdeep_BE.domain.auth.dto.TokenDto;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

@Service
public class JwtProvider {
    private final Key key;
    public static final int ACCESS_TOKEN_EXPIRE = 1000 * 60 * 60 * 24;
    public static final int REFRESH_TOKEN_EXPIRE = 1000 * 60 * 60 * 24 * 15;

    public JwtProvider(@Value("${jwt.secretKey}") String secretKey) {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (MalformedJwtException e) {
            throw new MalformedJwtException("위조된 토큰");
        } catch (ExpiredJwtException e) {
            throw new ExpiredJwtException(e.getHeader(), e.getClaims(), e.getMessage());
        } catch (UnsupportedJwtException e) {
            throw new UnsupportedJwtException(e.getMessage());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("토큰 에러");
        } catch (io.jsonwebtoken.security.SecurityException e) {
            throw new SecurityException("security exception");
        }
    }

    public String generateToken(Authentication authentication, long expireMills) {
        String authorities = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        long now = new Date().getTime();
        Date expiresIn = new Date(now + expireMills);
        return Jwts.builder()
                .setSubject(authentication.getName())
                .claim("auth", authorities)
                .setExpiration(expiresIn)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public TokenDto generateAuthenticationTokens(Member member) {
        Authentication authentication = authenticate(member);
        return TokenDto.builder()
                .accessToken(generateAccessToken(authentication))
                .refreshToken(generateRefreshToken(authentication))
                .build();
    }

    private String generateAccessToken(Authentication authentication) {
        return generateToken(authentication, ACCESS_TOKEN_EXPIRE);
    }

    private String generateRefreshToken(Authentication authentication) {
        return generateToken(authentication, REFRESH_TOKEN_EXPIRE);
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
