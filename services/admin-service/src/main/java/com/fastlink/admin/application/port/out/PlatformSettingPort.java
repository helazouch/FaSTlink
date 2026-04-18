package com.fastlink.admin.application.port.out;

import com.fastlink.admin.domain.model.PlatformSetting;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface PlatformSettingPort {

    PlatformSetting save(PlatformSetting platformSetting);

    List<PlatformSetting> findAllOrderByKey();

    Optional<PlatformSetting> findById(Long id);

    Optional<PlatformSetting> findBySettingKey(String settingKey);

    boolean existsBySettingKey(String settingKey);

    long count();

    long countByEnabled(boolean enabled);

    Optional<Instant> findLatestUpdatedAt();

    void delete(PlatformSetting platformSetting);
}
