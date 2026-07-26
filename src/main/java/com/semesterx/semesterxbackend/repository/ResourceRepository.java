package com.semesterx.semesterxbackend.repository;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.Resource;
import com.semesterx.semesterxbackend.entity.ResourceType;
import com.semesterx.semesterxbackend.entity.Semester;
import com.semesterx.semesterxbackend.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByActiveTrue();

    List<Resource> findByResourceTypeAndActiveTrue(ResourceType resourceType);

    List<Resource> findByDepartmentAndSemesterAndResourceTypeAndActiveTrue(
            Department department,
            Semester semester,
            ResourceType resourceType
    );

    List<Resource> findByDepartmentAndSemesterAndSubject_IdAndResourceTypeAndActiveTrue(
            Department department,
            Semester semester,
            Long subjectId,
            ResourceType resourceType
    );

}