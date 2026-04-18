package com.fastlink.admin.application.port.in;

import com.fastlink.admin.application.dto.setting.CreatePlatformSettingRequest;
import com.fastlink.admin.application.dto.setting.PlatformSettingResponse;
import com.fastlink.admin.application.dto.setting.UpdatePlatformSettingRequest;
import java.util.List;

public interface PlatformSettingUseCase {

    PlatformSettingResponse create(CreatePlatformSettingRequest request);

    List<PlatformSettingResponse> list();

    PlatformSettingResponse update(Long settingId, UpdatePlatformSettingRequest request);

    void delete(Long settingId);
}
