package com.fastlink.publication.infrastructure.persistence.adapter;

import com.fastlink.publication.application.port.out.MediaPort;
import com.fastlink.publication.domain.model.Media;
import com.fastlink.publication.infrastructure.persistence.jpa.MediaJpaRepository;
import org.springframework.stereotype.Component;

@Component
public class MediaPersistenceAdapter implements MediaPort {

    private final MediaJpaRepository mediaJpaRepository;

    public MediaPersistenceAdapter(MediaJpaRepository mediaJpaRepository) {
        this.mediaJpaRepository = mediaJpaRepository;
    }

    @Override
    public Media save(Media media) {
        return mediaJpaRepository.save(media);
    }
}
