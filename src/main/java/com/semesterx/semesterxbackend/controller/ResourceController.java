package com.semesterx.semesterxbackend.controller;

import com.semesterx.semesterxbackend.dto.ResourceRequest;
import com.semesterx.semesterxbackend.dto.ResourceResponse;
import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.ResourceType;
import com.semesterx.semesterxbackend.entity.Semester;
import com.semesterx.semesterxbackend.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public List<ResourceResponse> getResources(

            @RequestParam Department department,

            @RequestParam Semester semester,

            @RequestParam Long subjectId,

            @RequestParam ResourceType resourceType

    ) {

        return resourceService.getResources(
                department,
                semester,
                subjectId,
                resourceType
        );
    }

}