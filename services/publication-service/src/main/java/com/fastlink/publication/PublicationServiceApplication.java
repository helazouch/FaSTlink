package com.fastlink.publication;

import com.fastlink.publication.config.EntityClientProperties;
import com.fastlink.publication.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({EntityClientProperties.class, JwtProperties.class})
public class PublicationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PublicationServiceApplication.class, args);
    }
}
