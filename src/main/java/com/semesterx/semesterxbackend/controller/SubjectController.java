package com.semesterx.semesterxbackend.controller;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.Semester;
import com.semesterx.semesterxbackend.entity.Subject;
import com.semesterx.semesterxbackend.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public List<Subject> getSubjects(
            @RequestParam Department department,
            @RequestParam Semester semester
    ) {

        return subjectService.getSubjects(
                department,
                semester
        );

    }

}