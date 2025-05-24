package kr.dbdeep.dbdeep_BE.domain.project.api;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.AddChatRoomRequest;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.CreateProjectRequest;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.CreateProjectResponse;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.ProjectChatRoomResponse;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.ProjectListResponse;
import kr.dbdeep.dbdeep_BE.domain.project.application.ProjectService;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    public JSONResponse<CreateProjectResponse> create(@CurrentMemberId Integer memberId,
                                                      @RequestBody CreateProjectRequest request) {
        var created = projectService.create(memberId, request.title(), request.description());
        return JSONResponse.onSuccess(created);
    }

    @DeleteMapping("/{projectId}")
    public JSONResponse<Void> delete(@CurrentMemberId Integer memberId,
                                     @PathVariable Integer projectId) {
        projectService.delete(memberId, projectId);
        return JSONResponse.onSuccess();
    }

    @GetMapping
    public JSONResponse<List<ProjectListResponse>> getAll(@CurrentMemberId Integer memberId) {
        var projects = projectService.getAll(memberId);
        return JSONResponse.onSuccess(projects);
    }

    @PostMapping("/{projectId}/title")
    public JSONResponse<Void> updateTitle(@CurrentMemberId Integer memberId,
                                          @PathVariable Integer projectId,
                                          @RequestBody CreateProjectRequest request) {
        projectService.update(memberId, projectId, request.title(), request.description());
        return JSONResponse.onSuccess();
    }

    @PostMapping("/{projectId}")
    public JSONResponse<Void> addChatRoom(@CurrentMemberId Integer memberId,
                                          @PathVariable Integer projectId,
                                          @RequestBody AddChatRoomRequest request) {
        projectService.addChatRoom(memberId, projectId, request);
        return JSONResponse.onSuccess();
    }

    @GetMapping("/{projectId}")
    public JSONResponse<ProjectChatRoomResponse> getChatRooms(@CurrentMemberId Integer memberId,
                                                              @PathVariable Integer projectId) {
        var chatRooms = projectService.getChatRooms(memberId, projectId);
        return JSONResponse.onSuccess(chatRooms);
    }

    @DeleteMapping("/{projectId}/chatroom")
    public JSONResponse<Void> removeChatRoom(@CurrentMemberId Integer memberId,
                                             @PathVariable Integer projectId,
                                             @RequestBody AddChatRoomRequest request) {
        projectService.deleteChatRoom(memberId, projectId, request);
        return JSONResponse.onSuccess();
    }
}
