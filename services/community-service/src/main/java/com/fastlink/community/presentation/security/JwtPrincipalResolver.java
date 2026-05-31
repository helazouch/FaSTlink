package com.fastlink.community.presentation.security;

import com.fastlink.community.application.exception.ForbiddenOperationException;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class JwtPrincipalResolver {

    private static final Logger LOGGER = LoggerFactory.getLogger(JwtPrincipalResolver.class);

    public Long resolveUserId(Jwt jwt) {
        if (jwt == null) {
            LOGGER.warn("community_jwt_user_resolution claimNames=[] subjectPresent=false resolved=false");
            throw new ForbiddenOperationException("Identifiant utilisateur absent du JWT");
        }

        Set<String> claimNames = new TreeSet<>(jwt.getClaims().keySet());
        for (String claimName : List.of("uid", "userId", "user_id", "id", "utilisateurId", "subject", "sub")) {
            Long value = numericClaim(jwt, claimName);
            if (value != null) {
                LOGGER.info(
                        "community_jwt_user_resolution claimNames={} subjectPresent={} resolved=true claim={}",
                        claimNames,
                        jwt.getSubject() != null && !jwt.getSubject().isBlank(),
                        claimName);
                return value;
            }
        }

        String subject = jwt.getSubject();
        if (subject != null && subject.matches("\\d+")) {
            LOGGER.info(
                    "community_jwt_user_resolution claimNames={} subjectPresent=true resolved=true claim=subject",
                    claimNames);
            return Long.parseLong(subject);
        }

        LOGGER.warn(
                "community_jwt_user_resolution claimNames={} subjectPresent={} resolved=false",
                claimNames,
                subject != null && !subject.isBlank());
        throw new ForbiddenOperationException("Identifiant utilisateur absent du JWT");
    }

    public String resolveSenderName(Jwt jwt) {
        if (jwt == null) {
            return "Anonymous";
        }

        String name = jwt.getClaimAsString("name");
        if (name == null || name.trim().isEmpty()) {
            name = jwt.getClaimAsString("fullName");
        }
        if (name == null || name.trim().isEmpty()) {
            String sub = jwt.getSubject();
            if (sub != null && sub.contains("@")) {
                name = sub.substring(0, sub.indexOf("@"));
            } else {
                name = sub != null ? sub : "Anonymous";
            }
        }
        return name;
    }

    private Long numericClaim(Jwt jwt, String claimName) {
        Object value = jwt.getClaim(claimName);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
