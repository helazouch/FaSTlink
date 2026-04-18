package com.fastlink.admin.infrastructure.persistence.adapter;

import com.fastlink.admin.application.port.out.GlobalConfigPort;
import com.fastlink.admin.domain.model.GlobalConfig;
import com.fastlink.admin.infrastructure.persistence.repository.GlobalConfigJpaRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class GlobalConfigPersistenceAdapter implements GlobalConfigPort {

    private final GlobalConfigJpaRepository globalConfigJpaRepository;

    public GlobalConfigPersistenceAdapter(GlobalConfigJpaRepository globalConfigJpaRepository) {
        this.globalConfigJpaRepository = globalConfigJpaRepository;
    }

    @Override
    public GlobalConfig save(GlobalConfig globalConfig) {
        return globalConfigJpaRepository.save(globalConfig);
    }

    @Override
    public List<GlobalConfig> findAllOrderByKey() {
        return globalConfigJpaRepository.findAll().stream()
                .sorted(Comparator.comparing(GlobalConfig::getConfigKey, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Override
    public Optional<GlobalConfig> findById(Long id) {
        return globalConfigJpaRepository.findById(id);
    }

    @Override
    public Optional<GlobalConfig> findByConfigKey(String configKey) {
        return globalConfigJpaRepository.findByConfigKey(configKey);
    }

    @Override
    public boolean existsByConfigKey(String configKey) {
        return globalConfigJpaRepository.existsByConfigKey(configKey);
    }

    @Override
    public long count() {
        return globalConfigJpaRepository.count();
    }

    @Override
    public Optional<Instant> findLatestUpdatedAt() {
        return globalConfigJpaRepository.findFirstByOrderByUpdatedAtDesc().map(GlobalConfig::getUpdatedAt);
    }

    @Override
    public void delete(GlobalConfig globalConfig) {
        globalConfigJpaRepository.delete(globalConfig);
    }
}
