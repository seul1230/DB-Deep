package kr.dbdeep.dbdeep_BE.domain.chat.application;

import com.google.cloud.Timestamp;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import kr.dbdeep.dbdeep_BE.domain.chat.api.dto.AllowShareChatResponse;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatMessage;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatMessageRepository;
import kr.dbdeep.dbdeep_BE.domain.member.application.MemberService;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import kr.dbdeep.dbdeep_BE.domain.notification.entity.Notification;
import kr.dbdeep.dbdeep_BE.domain.notification.infrastructure.NotificationRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import kr.dbdeep.dbdeep_BE.global.exception.CommonException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ChatShareService {

    private final MemberService memberService;
    private final ChatRoomService chatRoomService;
    private final NotificationRepository notificationRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional
    public void share(Integer memberId, List<Integer> targetMemberIds, String chatroomId) {

        Member member = memberService.findById(memberId);
        ChatRoom chatRoom = chatRoomService.findById(chatroomId);

        List<Member> targets = memberService.findAllByIds(targetMemberIds);

        List<Notification> notifications = targets.stream()
                .map(target -> Notification.builder()
                        .member(member)
                        .target(target)
                        .chatroomId(chatroomId)
                        .chatName(chatRoom.getChatroomName())
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        notificationRepository.saveAll(notifications);
    }

    @Transactional
    public AllowShareChatResponse handleShareResponse(Integer memberId, Integer notificationId, Boolean accepted) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CommonException(ErrorCode.NOTIFICATION_NOT_FOUND));

        notification.setIsAccepted(accepted);

        if (!accepted) {
            return AllowShareChatResponse.builder().build();
        }

        ChatRoom originalChatRoom = chatRoomService.findById(notification.getChatroomId());
        List<ChatMessage> originalMessages = chatMessageRepository.findMessagesBeforeTimestamp(
                notification.getChatroomId(),
                Timestamp.of(java.sql.Timestamp.valueOf(notification.getCreatedAt()))
        );

        String newChatRoomId = UUID.randomUUID().toString();
        ChatRoom copiedChatRoom = ChatRoom.builder()
                .id(newChatRoomId)
                .memberId(memberId)
                .projectId(null)
                .chatroomName(originalChatRoom.getChatroomName())
                .lastMessageAt(originalChatRoom.getLastMessageAt())
                .build();
        chatRoomService.save(copiedChatRoom);

        List<ChatMessage> copiedMessages = originalMessages.stream()
                .map(m -> ChatMessage.builder()
                        .id(UUID.randomUUID().toString())
                        .chatRoomId(newChatRoomId)
                        .content(m.getContent())
                        .memberId(memberId)
                        .senderType(m.getSenderType())
                        .timestamp(m.getTimestamp())
                        .build())
                .toList();
        chatMessageRepository.saveAll(copiedMessages);

        return AllowShareChatResponse.builder()
                .chatRoomId(newChatRoomId)
                .build();
    }

}
