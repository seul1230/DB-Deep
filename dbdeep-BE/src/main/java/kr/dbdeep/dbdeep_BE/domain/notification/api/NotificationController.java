package kr.dbdeep.dbdeep_BE.domain.notification.api;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.auth.annotation.CurrentMemberId;
import kr.dbdeep.dbdeep_BE.domain.notification.api.dto.NotificationResponse;
import kr.dbdeep.dbdeep_BE.domain.notification.application.NotificationService;
import kr.dbdeep.dbdeep_BE.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public JSONResponse<List<NotificationResponse>> getAll(@CurrentMemberId Integer memberId) {
        return JSONResponse.onSuccess(notificationService.getAll(memberId));
    }

    @PatchMapping("/{notificationId}/read")
    public JSONResponse<Void> markAsRead(@CurrentMemberId Integer memberId,
                                         @PathVariable Integer notificationId) {
        notificationService.markAsRead(memberId, notificationId);
        return JSONResponse.onSuccess();
    }

}
