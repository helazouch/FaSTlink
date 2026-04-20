package com.fastlink.entity.application.port.in;

import com.fastlink.entity.application.dto.entity.CreateEntiteRequest;
import com.fastlink.entity.application.dto.entity.EntiteResponse;
import com.fastlink.entity.application.dto.entity.UpdateEntiteRequest;
import java.util.List;

public interface EntiteUseCase {

    List<EntiteResponse> listEntites();

    EntiteResponse createEntite(CreateEntiteRequest request);

    EntiteResponse updateEntite(Long entiteId, UpdateEntiteRequest request);

    void deleteEntite(Long entiteId);
}
