package com.fastlink.community.application.port.out;

import com.fastlink.community.application.dto.message.MessageCommunauteResponse;

public interface CommunityRealtimePort {

    void publishMessage(Long communauteId, MessageCommunauteResponse message);
}
