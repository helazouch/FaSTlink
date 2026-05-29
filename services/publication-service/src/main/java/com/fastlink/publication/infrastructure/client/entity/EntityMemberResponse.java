package com.fastlink.publication.infrastructure.client.entity;

public record EntityMemberResponse(Long id, Long entityId, Long userId, String role, String status) {
}
