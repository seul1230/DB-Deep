package kr.dbdeep.dbdeep_BE.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

@Configuration
public class RedisConfig {
    private String host;
    private int port;

    public RedisConfig(@Value("${spring.data.redis.port}") int port,
                       @Value("${spring.data.redis.host}") String host) {
        this.port = port;
        this.host = host;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

//    @Bean
//    public RedisTemplate<String, ?> redisTemplate() {
//        RedisTemplate<String, ?> redisTemplate = new RedisTemplate<>();
//        redisTemplate.setConnectionFactory(redisConnectionFactory());
//        redisTemplate.setKeySerializer(new StringRedisSerializer());
//        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
//        redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());
//
//        return redisTemplate;
//    }

}
