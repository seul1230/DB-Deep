package kr.dbdeep.dbdeep_BE.domain.project.api.dto;

import java.time.LocalDateTime;

public record ProjectListResponse(
        Integer projectId,
        String projectName,
        LocalDateTime createdAt
) {
}
