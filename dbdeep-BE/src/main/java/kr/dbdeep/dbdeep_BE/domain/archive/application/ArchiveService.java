package kr.dbdeep.dbdeep_BE.domain.archive.application;

import java.time.ZoneId;
import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.archive.api.dto.ArchivedMessageResponse;
import kr.dbdeep.dbdeep_BE.domain.archive.dto.RedirectResponse;
import kr.dbdeep.dbdeep_BE.domain.archive.entity.Archive;
import kr.dbdeep.dbdeep_BE.domain.archive.exception.ArchiveNotFoundException;
import kr.dbdeep.dbdeep_BE.domain.archive.infrastructure.ArchiveRepository;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatMessage;
import kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.ChatMessageRepository;
import kr.dbdeep.dbdeep_BE.global.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArchiveService {

    private final ArchiveRepository archiveRepository;
    private final ChatMessageRepository chatMessageRepository;

    public List<ArchivedMessageResponse> get(Integer memberId) {
        List<Archive> archives = archiveRepository.findAllByMemberId(memberId);

        return archives.stream().map(archive -> {
            log.info("##### Firestore에서 messageId={} 조회 시작", archive.getMessageId());
            ChatMessage message = chatMessageRepository.findById(archive.getMessageId());
            return ArchivedMessageResponse.from(
                    archive.getId(),
                    message.getId(),
                    message.getContent(),
                    message.getTimestamp().toDate().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime(),
                    archive.getCreatedAt()
            );
        }).toList();
    }

    public RedirectResponse redirect(Integer memberId, Integer archiveId) {
        Archive archive = archiveRepository.findById(archiveId)
                .orElseThrow(() -> new ArchiveNotFoundException(ErrorCode.ARCHIVE_NOT_FOUND));

        if (!archive.getMember().getId().equals(memberId)) {
            throw new ArchiveNotFoundException(ErrorCode.ARCHIVE_UNAUTHORIZED);
        }

        return new RedirectResponse(archive.getChatRoomId(), archive.getMessageId());
    }
}
