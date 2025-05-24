package kr.dbdeep.dbdeep_BE.domain.member.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import kr.dbdeep.dbdeep_BE.global.entity.BaseTimeEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "member")
@Getter
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    @Builder.Default
    private Department department = Department.builder().id(1).build();

    private String name;

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

    @Builder.Default
    @Column(name = "password_not_changed")
    private Boolean passwordNotChanged = false;

    public void resetPassword(String password) {
        this.password = password;
        passwordNotChanged = true;
    }

    public void updatePassword(String password) {
        this.password = password;
        passwordNotChanged = false;
    }


}
