package kr.dbdeep.dbdeep_BE.global.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirestoreConfig {
    private Firestore firestore;

    @PostConstruct
    public void initialize() throws IOException {
        InputStream serviceAccount = new FileInputStream("/app/credentials/key.json");
        GoogleCredentials credentials = GoogleCredentials.fromStream(serviceAccount);
        FirestoreOptions options = FirestoreOptions.newBuilder()
                .setCredentials(credentials)
                .build();
        this.firestore = options.getService();
    }

    @Bean
    public Firestore firestore() {
        return firestore;
    }
}

