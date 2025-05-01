package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch;

import java.util.List;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ChatMessageSearchRepository extends ElasticsearchRepository<ChatMessage, String> {
    List<ChatMessage> findByMemberIdAndContentContainingIgnoreCaseOrderByTimestampDesc(
            Integer memberId, String content);
}
