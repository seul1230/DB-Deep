package kr.dbdeep.dbdeep_BE.domain.member.entity;

import jakarta.persistence.*;
import kr.dbdeep.dbdeep_BE.global.entity.BaseTimeEntity;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Builder.Default
    @Column(name = "position_id")
    private Integer positionId = 1;

    @Builder.Default
    @Column(name = "department_id")
    private Integer departmentId = 1;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 60)
    private String password;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private MemberType type = MemberType.MEMBER;

    @Builder.Default
    @Column(name = "employee_id")
    private Integer employeeId = 1;

    @Column(name = "profile_image", length = 255)
    private String profileImage;

    @Builder.Default
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}
