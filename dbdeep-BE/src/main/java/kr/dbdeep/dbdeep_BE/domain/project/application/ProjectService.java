package kr.dbdeep.dbdeep_BE.domain.project.application;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.exception.ChatRoomNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatRoomRepository;
import kr.dbdeep.dbdeep_BE.domain.member.exception.MemberNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.member.infrastructure.MemberRepository;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.AddChatRoomRequest;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.CreateProjectResponse;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.ProjectChatRoomResponse;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.ProjectListResponse;
import kr.dbdeep.dbdeep_BE.domain.project.entity.Project;
import kr.dbdeep.dbdeep_BE.domain.project.exception.ChatRoomAlreadyExistsInProjectException;
import kr.dbdeep.dbdeep_BE.domain.project.exception.ProjectNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.project.infrastructure.ProjectRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;
    private final ChatRoomRepository chatRoomRepository;

    @Transactional
    public CreateProjectResponse create(Integer memberId, String title, String description) {
        Project project = Project.builder()
                .member(memberRepository.findById(memberId)
                        .orElseThrow(() -> new MemberNotFoundException(ErrorCode.MEMBER_NOT_FOUND)))
                .title(title)
                .description(description)
                .build();
        Project saved = projectRepository.save(project);
        return new CreateProjectResponse(saved.getId(), saved.getTitle());
    }

    @Transactional
    public void delete(Integer MemberId, Integer projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
        if (!project.getMember().getId().equals(MemberId)) {
            throw new ProjectNotFoundException(ErrorCode.PROJECT_UNAUTHORIZED);
        }
        projectRepository.deleteById(projectId);
    }

    @Transactional(readOnly = true)
    public List<ProjectListResponse> getAll(Integer memberId) {
        return projectRepository.findAllByMember(memberRepository.findById(memberId)
                        .orElseThrow(() -> new MemberNotFoundException(ErrorCode.MEMBER_NOT_FOUND)))
                .stream()
                .map(ProjectListResponse::from)
                .toList();
    }

    @Transactional
    public void update(Integer memberId, Integer projectId, String title, String description) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
        if (!project.getMember().getId().equals(memberId)) {
            throw new ProjectNotFoundException(ErrorCode.PROJECT_UNAUTHORIZED);
        }
        project.update(title, description);
    }

    @Transactional
    public void addChatRoom(Integer memberId, Integer projectId, AddChatRoomRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
        ChatRoom chatRoom = chatRoomRepository.findById(request.chatId())
                .orElseThrow(() -> new ChatRoomNotFoundException(ErrorCode.CHAT_ROOM_NOT_FOUND));

        if (!project.getMember().getId().equals(memberId) || !chatRoom.getMemberId().equals(memberId)) {
            throw new ProjectNotFoundException(ErrorCode.PROJECT_UNAUTHORIZED);
        }

        if (chatRoom.getProjectId() != null && chatRoom.getProjectId().equals(projectId)) {
            throw new ChatRoomAlreadyExistsInProjectException(ErrorCode.CHAT_ROOM_ALREADY_EXISTS_IN_PROJECT);
        }

        chatRoom.connectToProject(projectId);
    }


    @Transactional(readOnly = true)
    public ProjectChatRoomResponse getChatRooms(Integer memberId, Integer projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
        if (!project.getMember().getId().equals(memberId)) {
            throw new ProjectNotFoundException(ErrorCode.PROJECT_UNAUTHORIZED);
        }

        List<ChatRoom> chatRooms = chatRoomRepository.findAllByProjectId(projectId);
        return ProjectChatRoomResponse.from(project, chatRooms);
    }

    @Transactional
    public void deleteChatRoom(Integer memberId, Integer projectId, AddChatRoomRequest chatRoomId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ProjectNotFoundException(ErrorCode.PROJECT_NOT_FOUND));
        if (!project.getMember().getId().equals(memberId)) {
            throw new ProjectNotFoundException(ErrorCode.PROJECT_UNAUTHORIZED);
        }
        ChatRoom chatRoom = chatRoomRepository.findByIdAndProjectId(chatRoomId.chatId(), projectId);
        chatRoom.disconnectFromProject();
    }
}
