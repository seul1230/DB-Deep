package kr.dbdeep.dbdeep_BE.domain.notification.application;

import java.util.Comparator;
import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.member.application.MemberService;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import kr.dbdeep.dbdeep_BE.domain.notification.api.dto.NotificationResponse;
import kr.dbdeep.dbdeep_BE.domain.notification.entity.Notification;
import kr.dbdeep.dbdeep_BE.domain.notification.exception.NotificationException;
import kr.dbdeep.dbdeep_BE.domain.notification.infrastructure.NotificationRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final MemberService memberService;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAll(Integer memberId) {
        List<Notification> notifications = notificationRepository.findByTargetId(memberId);
        if (notifications.isEmpty()) {
            throw new NotificationException(ErrorCode.NOTIFICATION_IS_EMPTY);
        }
        return notifications.stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt).reversed())
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional
    public void markAsRead(Integer memberId, Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationException(ErrorCode.NOTIFICATION_NOT_FOUND));

        Member member = memberService.findById(memberId);

        if (!notification.getTarget().equals(member)) {
            throw new NotificationException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }

        notification.markAsRead();
    }

    @Transactional
    public void delete(Integer memberId, Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationException(ErrorCode.NOTIFICATION_NOT_FOUND));

        Member member = memberService.findById(memberId);

        if (!notification.getTarget().equals(member)) {
            throw new NotificationException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }
        notificationRepository.delete(notification);
    }

}
