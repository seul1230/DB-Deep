def is_hr_team(department: str) -> bool:
    return department.strip() in {"인사팀", "인사관리", "인력개발"}
