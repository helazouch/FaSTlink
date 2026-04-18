package com.fastlink.admin.infrastructure.persistence.repository;

import com.fastlink.admin.domain.model.GlobalConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GlobalConfigJpaRepository extends JpaRepository<GlobalConfig, Long> {

    boolean existsByConfigKey(String configKey);

    Optional<GlobalConfig> findByConfigKey(String configKey);

    Optional<GlobalConfig> findFirstByOrderByUpdatedAtDesc();
}
