package com.fastlink.request.application.port.out;

import java.util.List;

public interface EntityMembershipPort {

    List<Long> findActiveCoordinatorUserIds(Long entiteId);
}
