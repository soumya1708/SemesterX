package com.semesterx.semesterxbackend.service.impl;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.Semester;
import com.semesterx.semesterxbackend.entity.Subject;
import com.semesterx.semesterxbackend.repository.SubjectRepository;
import com.semesterx.semesterxbackend.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;

    @Override
    public List<Subject> getSubjects(
            Department department,
            Semester semester
    ) {

        if (semester == null) {
            return subjectRepository.findByDepartment(department);
        }

        return subjectRepository.findByDepartmentAndSemester(
                department,
                semester
        );
    }
}