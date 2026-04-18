package com.fastlink.publication.application.port.out;

import com.fastlink.publication.domain.model.Media;

public interface MediaPort {

    Media save(Media media);
}
