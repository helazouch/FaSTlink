package com.fastlink.analytics.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "integration.platform")
public class PlatformClientProperties {

    @NotBlank
    private String identityBaseUrl = "http://localhost:8080";

    @NotBlank
    private String entityBaseUrl = "http://localhost:8081";

    @NotBlank
    private String publicationBaseUrl = "http://localhost:8082";

    @NotBlank
    private String eventBaseUrl = "http://localhost:8083";

    @NotBlank
    private String communityBaseUrl = "http://localhost:8084";

    @NotBlank
    private String notificationBaseUrl = "http://localhost:8087";

    @Min(100)
    private int connectTimeoutMs = 3000;

    @Min(100)
    private int readTimeoutMs = 5000;

    public String getIdentityBaseUrl() {
        return identityBaseUrl;
    }

    public void setIdentityBaseUrl(String identityBaseUrl) {
        this.identityBaseUrl = identityBaseUrl;
    }

    public String getEntityBaseUrl() {
        return entityBaseUrl;
    }

    public void setEntityBaseUrl(String entityBaseUrl) {
        this.entityBaseUrl = entityBaseUrl;
    }

    public String getPublicationBaseUrl() {
        return publicationBaseUrl;
    }

    public void setPublicationBaseUrl(String publicationBaseUrl) {
        this.publicationBaseUrl = publicationBaseUrl;
    }

    public String getEventBaseUrl() {
        return eventBaseUrl;
    }

    public void setEventBaseUrl(String eventBaseUrl) {
        this.eventBaseUrl = eventBaseUrl;
    }

    public String getCommunityBaseUrl() {
        return communityBaseUrl;
    }

    public void setCommunityBaseUrl(String communityBaseUrl) {
        this.communityBaseUrl = communityBaseUrl;
    }

    public String getNotificationBaseUrl() {
        return notificationBaseUrl;
    }

    public void setNotificationBaseUrl(String notificationBaseUrl) {
        this.notificationBaseUrl = notificationBaseUrl;
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
