package com.semesterx.semesterxbackend.dto;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.entity.ResourceType;
import com.semesterx.semesterxbackend.entity.Semester;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponse {

    private Long id;

    private String title;

    private String description;

    private Department department;

    private Semester semester;

    private Long subjectId;

    private String subjectName;

    private ResourceType resourceType;

    private String fileUrl;

    private String thumbnailUrl;

}