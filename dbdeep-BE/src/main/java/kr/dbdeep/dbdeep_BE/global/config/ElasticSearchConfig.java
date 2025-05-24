package kr.dbdeep.dbdeep_BE.global.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.json.jackson.JacksonJsonpMapper;
import co.elastic.clients.transport.rest_client.RestClientTransport;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ElasticSearchConfig {

    @Value("${spring.elasticsearch.uris}")
    private String url;

    @Bean
    public RestClient restClient() {
        return RestClient.builder(HttpHost.create(url)).build();
    }

    @Bean
    public ElasticsearchClient elasticsearchClient(RestClient restClient) {
        RestClientTransport transport = new RestClientTransport(
                restClient,
                new JacksonJsonpMapper()
        );
        return new ElasticsearchClient(transport);
    }
}