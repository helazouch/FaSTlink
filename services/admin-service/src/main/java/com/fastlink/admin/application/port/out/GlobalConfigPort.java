package com.fastlink.admin.application.port.out;

import com.fastlink.admin.domain.model.GlobalConfig;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface GlobalConfigPort {

    GlobalConfig save(GlobalConfig globalConfig);

    List<GlobalConfig> findAllOrderByKey();

    Optional<GlobalConfig> findById(Long id);

    Optional<GlobalConfig> findByConfigKey(String configKey);

    boolean existsByConfigKey(String configKey);

    long count();

    Optional<Instant> findLatestUpdatedAt();

    void delete(GlobalConfig globalConfig);
}
