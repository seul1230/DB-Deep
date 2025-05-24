package kr.dbdeep.dbdeep_BE.domain.member.infrastructure;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.List;
import kr.dbdeep.dbdeep_BE.domain.member.dto.MemberDto;
import kr.dbdeep.dbdeep_BE.domain.member.entity.QDepartment;
import kr.dbdeep.dbdeep_BE.domain.member.entity.QMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MemberQueryRepository {

    private final JPAQueryFactory queryFactory;

    public List<MemberDto> searchByOneCondition(String name, String email, String departmentName) {
        QMember member = QMember.member;
        QDepartment department = QDepartment.department;

        BooleanBuilder builder = new BooleanBuilder();

        if (name != null) {
            builder.and(member.name.containsIgnoreCase(name));
        } else if (email != null) {
            builder.and(member.email.containsIgnoreCase(email));
        } else if (departmentName != null) {
            builder.and(department.name.containsIgnoreCase(departmentName));
        }

        return queryFactory
                .select(Projections.constructor(MemberDto.class,
                        member.id,
                        member.name,
                        member.email,
                        member.profileImage,
                        department.name))
                .from(member)
                .join(member.department, department)
                .where(builder)
                .fetch();
    }
}
