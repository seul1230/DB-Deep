package kr.dbdeep.dbdeep_BE.domain.notification.infrastructure;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByMemberId(Integer memberId);
}
