package com.fastlink.admin.infrastructure.persistence.repository;

import com.fastlink.admin.domain.model.PlatformSetting;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingJpaRepository extends JpaRepository<PlatformSetting, Long> {

    boolean existsBySettingKey(String settingKey);

    Optional<PlatformSetting> findBySettingKey(String settingKey);

    long countByEnabled(boolean enabled);

    Optional<PlatformSetting> findFirstByOrderByUpdatedAtDesc();
}
