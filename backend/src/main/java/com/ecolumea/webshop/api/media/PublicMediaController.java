package com.ecolumea.webshop.api.media;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/media")
public class PublicMediaController {

    private final Path storagePath;

    public PublicMediaController(@Value("${app.media.storage-path}") String storagePath) {
        this.storagePath = Paths.get(storagePath);
    }

    @GetMapping("/{fileName:.+}")
    public ResponseEntity<Resource> getMedia(@PathVariable String fileName) {
        if (fileName.contains("..")) {
            throw new ResponseStatusException(NOT_FOUND, "File not found");
        }

        Path filePath = storagePath.resolve(fileName).normalize();
        if (!filePath.startsWith(storagePath)) {
            throw new ResponseStatusException(NOT_FOUND, "File not found");
        }

        Resource resource;
        try {
            resource = new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(NOT_FOUND, "File not found");
        }

        if (!resource.exists()) {
            throw new ResponseStatusException(NOT_FOUND, "File not found");
        }

        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        try {
            String contentType = Files.probeContentType(filePath);
            if (contentType != null && !contentType.isBlank()) {
                mediaType = MediaType.parseMediaType(contentType);
            }
        } catch (Exception ignored) {
            // Use default content type
        }

        return ResponseEntity.ok().contentType(mediaType).body(resource);
    }
}
