package kr.dbdeep.dbdeep_BE.domain.project.infrastructure;

import kr.dbdeep.dbdeep_BE.domain.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
}
