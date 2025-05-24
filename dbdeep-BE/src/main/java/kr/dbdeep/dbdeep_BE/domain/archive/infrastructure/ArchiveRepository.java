package kr.dbdeep.dbdeep_BE.domain.archive.infrastructure;

import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.archive.entity.Archive;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArchiveRepository extends JpaRepository<Archive, Integer> {
    List<Archive> findAllByMemberId(Integer memberId);
}
