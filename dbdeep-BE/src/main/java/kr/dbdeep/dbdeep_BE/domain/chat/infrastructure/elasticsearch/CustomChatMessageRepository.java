package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure.elasticsearch;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.data.elasticsearch.core.query.StringQuery;
import org.springframework.stereotype.Repository;


@Repository
@RequiredArgsConstructor
public class CustomChatMessageRepository {

    private final ElasticsearchOperations elasticsearchOperations;

    public List<ChatMessage> searchByMemberIdAndKeyword(Integer memberId, String keyword) {
        String queryJson = """
                {
                  "bool": {
                    "must": [
                      { "match": { "memberId": %d }},
                      {
                        "bool": {
                          "should": [
                            { "match": { "content.question": "%s" }},
                            { "match": { "content.insight": "%s" }}
                          ],
                          "minimum_should_match": 1
                        }
                      }
                    ]
                  }
                }
                """.formatted(memberId, escapeJson(keyword), escapeJson(keyword));

        Query query = new StringQuery(queryJson);

        return elasticsearchOperations
                .search(query, ChatMessage.class)
                .stream()
                .map(SearchHit::getContent)
                .toList();
    }

    private String escapeJson(String input) {
        return input.replace("\"", "\\\"").replace("\n", "\\n");
    }


}
