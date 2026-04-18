package com.fastlink.request.application.port.out;

import com.fastlink.request.domain.model.Demande;

public interface RequestEventPort {

    void publishRequestSubmitted(Demande demande);

    void publishRequestApproved(Demande demande);

    void publishRequestRejected(Demande demande);
}
