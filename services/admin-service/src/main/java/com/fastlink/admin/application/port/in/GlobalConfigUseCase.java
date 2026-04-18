package com.fastlink.admin.application.port.in;

import com.fastlink.admin.application.dto.config.CreateGlobalConfigRequest;
import com.fastlink.admin.application.dto.config.GlobalConfigResponse;
import com.fastlink.admin.application.dto.config.UpdateGlobalConfigRequest;
import java.util.List;

public interface GlobalConfigUseCase {

    GlobalConfigResponse create(CreateGlobalConfigRequest request);

    List<GlobalConfigResponse> list();

    GlobalConfigResponse update(Long configId, UpdateGlobalConfigRequest request);

    void delete(Long configId);
}
