package com.fastlink.admin.infrastructure.persistence.adapter;

import com.fastlink.admin.application.port.out.PlatformSettingPort;
import com.fastlink.admin.domain.model.PlatformSetting;
import com.fastlink.admin.infrastructure.persistence.repository.PlatformSettingJpaRepository;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class PlatformSettingPersistenceAdapter implements PlatformSettingPort {

    private final PlatformSettingJpaRepository platformSettingJpaRepository;

    public PlatformSettingPersistenceAdapter(PlatformSettingJpaRepository platformSettingJpaRepository) {
        this.platformSettingJpaRepository = platformSettingJpaRepository;
    }

    @Override
    public PlatformSetting save(PlatformSetting platformSetting) {
        return platformSettingJpaRepository.save(platformSetting);
    }

    @Override
    public List<PlatformSetting> findAllOrderByKey() {
        return platformSettingJpaRepository.findAll().stream()
                .sorted(Comparator.comparing(PlatformSetting::getSettingKey, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @Override
    public Optional<PlatformSetting> findById(Long id) {
        return platformSettingJpaRepository.findById(id);
    }

    @Override
    public Optional<PlatformSetting> findBySettingKey(String settingKey) {
        return platformSettingJpaRepository.findBySettingKey(settingKey);
    }

    @Override
    public boolean existsBySettingKey(String settingKey) {
        return platformSettingJpaRepository.existsBySettingKey(settingKey);
    }

    @Override
    public long count() {
        return platformSettingJpaRepository.count();
    }

    @Override
    public long countByEnabled(boolean enabled) {
        return platformSettingJpaRepository.countByEnabled(enabled);
    }

    @Override
    public Optional<Instant> findLatestUpdatedAt() {
        return platformSettingJpaRepository.findFirstByOrderByUpdatedAtDesc().map(PlatformSetting::getUpdatedAt);
    }

    @Override
    public void delete(PlatformSetting platformSetting) {
        platformSettingJpaRepository.delete(platformSetting);
    }
}
