package kr.dbdeep.dbdeep_BE.domain.project.api.dto;

public record CreateProjectRequest(
        String title,
        String description
) {
}
