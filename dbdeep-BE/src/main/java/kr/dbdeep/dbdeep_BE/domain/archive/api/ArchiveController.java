package kr.dbdeep.dbdeep_BE.domain.archive.api;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.archive.api.dto.ArchiveMessageRequest;
import kr.dbdeep.dbdeep_BE.domain.archive.api.dto.ArchivedMessageResponse;
import kr.dbdeep.dbdeep_BE.domain.archive.application.ArchiveService;
import kr.dbdeep.dbdeep_BE.domain.archive.dto.RedirectResponse;
import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/archives")
@RequiredArgsConstructor
public class ArchiveController {

    private final ArchiveService archiveService;

    @GetMapping
    public JSONResponse<List<ArchivedMessageResponse>> get(@CurrentMemberId Integer memberId) {
        return JSONResponse.onSuccess(archiveService.get(memberId));
    }

    @GetMapping("/{archiveId}/redirect")
    public JSONResponse<RedirectResponse> redirectToChat(@CurrentMemberId Integer memberId,
                                                         @PathVariable Integer archiveId) {
        return JSONResponse.onSuccess(archiveService.redirect(memberId, archiveId));
    }

    @PostMapping
    public JSONResponse<Void> archive(@CurrentMemberId Integer memberId, @RequestBody ArchiveMessageRequest request) {
        archiveService.add(memberId, request.messageId());
        return JSONResponse.onSuccess();
    }
}
