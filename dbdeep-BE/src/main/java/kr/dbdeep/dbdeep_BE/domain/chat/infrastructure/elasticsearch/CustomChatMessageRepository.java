package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Criteria;
import org.springframework.data.elasticsearch.core.query.CriteriaQuery;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Repository;


@Repository
@RequiredArgsConstructor
public class CustomChatMessageRepository {

    private final ElasticsearchOperations elasticsearchOperations;

    public List<ChatMessage> searchByMemberIdAndKeyword(Integer memberId, String keyword) {
        Criteria criteria = new Criteria("memberId").is(memberId)
                .and(
                        new Criteria().or("content.question").matches(keyword)
                                .or("content.insight").matches(keyword)
                );

        Query query = new CriteriaQuery(criteria);
        return elasticsearchOperations
                .search(query, ChatMessage.class)
                .stream()
                .map(SearchHit::getContent)
                .toList();
    }


}
