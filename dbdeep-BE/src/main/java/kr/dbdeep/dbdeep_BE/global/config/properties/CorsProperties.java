package kr.dbdeep.dbdeep_BE.global.config.properties;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cors")
public class CorsProperties {
    private List<String> allowedOrigins;

    public List<String> getAllowedOrigins() {return allowedOrigins;}

    public void setAllowedOrigins(List<String> allowedOrigins) {this.allowedOrigins = allowedOrigins;}
}
