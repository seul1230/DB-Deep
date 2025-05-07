package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    List<ChatRoom> findAllByProjectId(Integer projectId);

    ChatRoom findByIdAndProjectId(String chatRoomId, Integer projectId);
}
