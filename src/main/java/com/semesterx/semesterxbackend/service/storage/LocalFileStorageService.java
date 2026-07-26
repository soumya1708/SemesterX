package com.semesterx.semesterxbackend.service.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    public String uploadFile(MultipartFile file, String folder) {

        try {

            Path directory = Paths.get(uploadDir, folder);

            Files.createDirectories(directory);

            String filename =
                    UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path destination =
                    directory.resolve(filename);

            Files.copy(
                    file.getInputStream(),
                    destination,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "/" + uploadDir + "/" + folder + "/" + filename;

        } catch (IOException e) {

            throw new RuntimeException("File upload failed", e);

        }

    }

}