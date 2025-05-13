package kr.dbdeep.dbdeep_BE.domain.project.api.dto;

import java.time.LocalDateTime;
import kr.dbdeep.dbdeep_BE.domain.project.entity.Project;
import lombok.Builder;

@Builder
public record ProjectListResponse(
        Integer projectId,
        String projectName,
        Integer chatCount,
        LocalDateTime createdAt
) {
    public static ProjectListResponse from(Project project) {
        return ProjectListResponse.builder()
                .projectId(project.getId())
                .projectName(project.getTitle())
                .chatCount(project.getChatRooms().size())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
