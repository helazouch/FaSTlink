package com.fastlink.request.application.port.out;

import com.fastlink.request.domain.model.Demande;
import java.util.List;

public interface RequestEventPort {

    void publishRequestSubmitted(Demande demande, List<Long> recipientUtilisateurIds);

    void publishRequestApproved(Demande demande);

    void publishRequestRejected(Demande demande);
}
