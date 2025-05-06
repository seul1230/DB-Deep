package kr.dbdeep.dbdeep_BE.domain.archive.api;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.archive.api.dto.ArchivedMessageResponse;
import kr.dbdeep.dbdeep_BE.domain.archive.application.ArchiveService;
import kr.dbdeep.dbdeep_BE.domain.archive.dto.RedirectResponse;
import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/archives")
@RequiredArgsConstructor
public class ArchiveController {

    private final ArchiveService archiveService;

    @GetMapping
    public List<ArchivedMessageResponse> get(@CurrentMemberId Integer memberId) {
        return archiveService.get(memberId);
    }

    @GetMapping("/{archiveId}/redirect")
    public RedirectResponse redirectToChat(@CurrentMemberId Integer memberId, @PathVariable Integer archiveId) {
        return archiveService.redirect(memberId, archiveId);
    }
}
