package com.fastlink.event;

import com.fastlink.event.config.EntityClientProperties;
import com.fastlink.event.config.JwtProperties;
import com.fastlink.event.config.NotificationClientProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({EntityClientProperties.class, JwtProperties.class, NotificationClientProperties.class})
public class EventServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventServiceApplication.class, args);
    }
}
