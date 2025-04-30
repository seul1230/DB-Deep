package kr.dbdeep.dbdeep_BE.domain.auth.infrastructure;

import java.util.Optional;
import kr.dbdeep.dbdeep_BE.domain.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    Optional<Member> findByEmail(String email);;
}
