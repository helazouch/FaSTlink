package com.fastlink.request.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "integration.entity")
public class EntityClientProperties {

    @NotBlank
    private String baseUrl;

    @NotBlank
    private String permissionCheckPath = "/api/v1/internal/entities/{entiteId}/permissions/check";

    @NotBlank
    private String membersPath = "/api/v1/entities/{entiteId}/members";

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

    public String getPermissionCheckPath() {
        return permissionCheckPath;
    }

    public void setPermissionCheckPath(String permissionCheckPath) {
        this.permissionCheckPath = permissionCheckPath;
    }

    public String getMembersPath() {
        return membersPath;
    }

    public void setMembersPath(String membersPath) {
        this.membersPath = membersPath;
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
