package kr.dbdeep.dbdeep_BE.domain.chat.infrastructure;

import kr.dbdeep.dbdeep_BE.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Integer> {
}
