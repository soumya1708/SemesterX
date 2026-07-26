package com.semesterx.semesterxbackend.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    String uploadFile(MultipartFile file, String folder);

}