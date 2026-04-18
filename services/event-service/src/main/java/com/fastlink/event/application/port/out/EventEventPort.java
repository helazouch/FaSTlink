package com.fastlink.event.application.port.out;

import com.fastlink.event.domain.model.Evenement;

public interface EventEventPort {

    void publishEventCreated(Evenement evenement);
}
