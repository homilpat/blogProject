package com.knowledge.blog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    @Bean
    WebClient.Builder webClientBuilder() {
        HttpClient httpClient = HttpClient.create()
                .resolver(spec -> spec
                        .cacheMinTimeToLive(Duration.ZERO)
                        .cacheMaxTimeToLive(Duration.ofSeconds(5))
                        .cacheNegativeTimeToLive(Duration.ZERO)
                        .queryTimeout(Duration.ofSeconds(5)));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient));
    }
}
