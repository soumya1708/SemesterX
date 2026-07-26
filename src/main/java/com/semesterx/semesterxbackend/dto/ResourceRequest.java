package com.semesterx.semesterxbackend.dto;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.ResourceType;
import com.semesterx.semesterxbackend.entity.Semester;
import com.semesterx.semesterxbackend.entity.Subject;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequest {

    private String title;

    private String description;

    private Department department;

    private Semester semester;

    private Long subjectId;

    private ResourceType resourceType;

    // PDF file uploaded by admin
    private MultipartFile file;

}