package kr.dbdeep.dbdeep_BE.domain.project.api;

import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.CreateProjectRequest;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.CreateProjectResponse;
import kr.dbdeep.dbdeep_BE.domain.project.application.ProjectService;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public JSONResponse<CreateProjectResponse> createProject(@CurrentMemberId Integer memberId,
                                                             @RequestBody CreateProjectRequest request) {
        var created = projectService.create(memberId, request.title());
        return JSONResponse.onSuccess(created);
    }
}
