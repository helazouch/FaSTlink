package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Media;
import java.util.List;

public interface MediaPort {

    Media save(Media media);

    List<Media> findByPublicationId(Long publicationId);
}
