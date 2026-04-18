package com.fastlink.entity.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "integration.identity")
public class IdentityClientProperties {

    @NotBlank
    private String baseUrl;

    @NotBlank
    private String userExistsPath = "/api/v1/internal/users/{userId}/exists";

    @Min(100)
    private int connectTimeoutMs = 3000;

    @Min(100)
    private int readTimeoutMs = 5000;

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getUserExistsPath() {
        return userExistsPath;
    }

    public void setUserExistsPath(String userExistsPath) {
        this.userExistsPath = userExistsPath;
    }

    public int getConnectTimeoutMs() {
        return connectTimeoutMs;
    }

    public void setConnectTimeoutMs(int connectTimeoutMs) {
        this.connectTimeoutMs = connectTimeoutMs;
    }

    public int getReadTimeoutMs() {
        return readTimeoutMs;
    }

    public void setReadTimeoutMs(int readTimeoutMs) {
        this.readTimeoutMs = readTimeoutMs;
    }
}
