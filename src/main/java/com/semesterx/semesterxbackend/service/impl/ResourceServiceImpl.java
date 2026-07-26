package com.semesterx.semesterxbackend.service.impl;

import com.semesterx.semesterxbackend.dto.ResourceRequest;
import com.semesterx.semesterxbackend.dto.ResourceResponse;
import com.semesterx.semesterxbackend.entity.*;
import com.semesterx.semesterxbackend.repository.ResourceRepository;
import com.semesterx.semesterxbackend.repository.SubjectRepository;
import com.semesterx.semesterxbackend.service.ResourceService;
import com.semesterx.semesterxbackend.service.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final SubjectRepository subjectRepository;
    private final FileStorageService fileStorageService;
    private ResourceResponse mapToResponse(Resource resource) {

        return ResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .department(resource.getDepartment())
                .semester(resource.getSemester())
                .subjectId(resource.getSubject().getId())
                .subjectName(resource.getSubject().getName())
                .resourceType(resource.getResourceType())
                .fileUrl(resource.getFileUrl())
                .thumbnailUrl(resource.getThumbnailUrl())
                .build();
    }

    @Override
    public ResourceResponse uploadResource(
            ResourceRequest request,
            String uploadedBy
    ) {

        return null;
    }

    @Override
    public List<ResourceResponse> getResources(
            Department department,
            Semester semester,
            Long subjectId,
            ResourceType resourceType
    ) {

        return null;
    }
}