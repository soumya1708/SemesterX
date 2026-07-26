package com.semesterx.semesterxbackend.service;

import com.semesterx.semesterxbackend.dto.ResourceRequest;
import com.semesterx.semesterxbackend.dto.ResourceResponse;
import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.ResourceType;
import com.semesterx.semesterxbackend.entity.Semester;

import java.util.List;

public interface ResourceService {

    ResourceResponse uploadResource(
            ResourceRequest request,
            String uploadedBy
    );

    List<ResourceResponse> getResources(
            Department department,
            Semester semester,
            Long subjectId,
            ResourceType resourceType
    );
}