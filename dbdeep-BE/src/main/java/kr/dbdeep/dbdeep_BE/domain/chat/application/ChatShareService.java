package kr.dbdeep.dbdeep_BE.domain.chat.application;

import java.util.List;
import java.util.stream.Collectors;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.member.application.MemberService;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import kr.dbdeep.dbdeep_BE.domain.notification.entity.Notification;
import kr.dbdeep.dbdeep_BE.domain.notification.infrastructure.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChatShareService {

    private final MemberService memberService;
    private final ChatRoomService chatRoomService;
    private final NotificationRepository notificationRepository;

    @Transactional
    public void share(Integer memberId, List<Integer> targetMemberIds, String chatroomId) {

        Member member = memberService.findById(memberId);
        ChatRoom chatRoom = chatRoomService.findById(chatroomId);

        List<Notification> notifications = targetMemberIds.stream()
                .map(targetId -> Notification.builder()
                        .memberId(targetId)
                        .content(member.getName() + "님이 " + chatRoom.getChatroomName() + "를 공유했습니다")
                        .chatroomId(chatroomId)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
    }

}
