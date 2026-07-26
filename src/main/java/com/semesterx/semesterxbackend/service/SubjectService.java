package com.semesterx.semesterxbackend.service;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.Semester;
import com.semesterx.semesterxbackend.entity.Subject;

import java.util.List;

public interface SubjectService {

    List<Subject> getSubjects(
            Department department,
            Semester semester
    );

}