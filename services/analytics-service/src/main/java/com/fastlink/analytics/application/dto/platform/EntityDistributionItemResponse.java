package com.fastlink.analytics.application.dto.platform;

public record EntityDistributionItemResponse(
        Long entiteId,
        String nom,
        long members,
        long bureauMembers,
        long coordinators) {
}
