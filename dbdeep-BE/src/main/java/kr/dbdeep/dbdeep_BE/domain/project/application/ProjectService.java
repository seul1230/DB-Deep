package kr.dbdeep.dbdeep_BE.domain.project.application;

import kr.dbdeep.dbdeep_BE.domain.member.exception.MemberNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.member.infrastructure.MemberRepository;
import kr.dbdeep.dbdeep_BE.domain.project.api.dto.CreateProjectResponse;
import kr.dbdeep.dbdeep_BE.domain.project.entity.Project;
import kr.dbdeep.dbdeep_BE.domain.project.infrastructure.ProjectRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;

    public CreateProjectResponse create(Integer memberId, String title) {
        Project project = Project.builder()
                .member(memberRepository.findById(memberId)
                        .orElseThrow(() -> new MemberNotFoundException(ErrorCode.MEMBER_NOT_FOUND)))
                .title(title).build();
        Project saved = projectRepository.save(project);
        return new CreateProjectResponse(saved.getId(), saved.getTitle());
    }
}
