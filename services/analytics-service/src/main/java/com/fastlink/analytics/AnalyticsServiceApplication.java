package com.fastlink.analytics;

import com.fastlink.analytics.config.JwtProperties;
import com.fastlink.analytics.config.EntityClientProperties;
import com.fastlink.analytics.config.PlatformClientProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
@EnableConfigurationProperties({EntityClientProperties.class, PlatformClientProperties.class, JwtProperties.class})
public class AnalyticsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }
}
