package kr.dbdeep.dbdeep_BE.domain.archive.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record ArchiveMessageRequest(
        @NotNull
        String messageId
) {
}
