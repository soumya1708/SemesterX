package com.semesterx.semesterxbackend.repository;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.Semester;
import com.semesterx.semesterxbackend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByDepartment(Department department);

    List<Subject> findByDepartmentAndSemester(
            Department department,
            Semester semester
    );
}