package com.ecolumea.webshop.api.admin.media;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class AdminMediaService {

    private final JdbcTemplate jdbcTemplate;
    private final Path storagePath;
    private final String mediaBaseUrl;

    public AdminMediaService(
        JdbcTemplate jdbcTemplate,
        @Value("${app.media.storage-path}") String storagePath,
        @Value("${app.media.public-base-url:/media}") String mediaBaseUrl
    ) {
        this.jdbcTemplate = jdbcTemplate;
        this.storagePath = Paths.get(storagePath);
        this.mediaBaseUrl = normalizeBaseUrl(mediaBaseUrl);
    }

    public List<AdminMediaProductOption> getProductOptions() {
        return jdbcTemplate.query(
            """
            SELECT p.id, p.name, p.slug
            FROM products p
            ORDER BY p.name ASC, p.id ASC
            """,
            (rs, rowNum) -> new AdminMediaProductOption(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("slug")
            )
        );
    }

    public List<AdminProductImageView> getProductImages(long productId) {
        ensureProductExists(productId);
        return jdbcTemplate.query(
            """
            SELECT id, product_id, file_path, title, alt_text, sort_order, is_primary
            FROM product_images
            WHERE product_id = ?
            ORDER BY is_primary DESC, sort_order ASC, id ASC
            """,
            (rs, rowNum) -> new AdminProductImageView(
                rs.getLong("id"),
                rs.getLong("product_id"),
                rs.getString("file_path"),
                rs.getString("title"),
                rs.getString("alt_text"),
                rs.getInt("sort_order"),
                rs.getBoolean("is_primary"),
                toMediaUrl(rs.getString("file_path"))
            ),
            productId
        );
    }

    @Transactional
    public AdminProductImageView uploadProductImage(
        long productId,
        MultipartFile file,
        String title,
        String altText,
        Integer sortOrder,
        Boolean isPrimary
    ) {
        ensureProductExists(productId);
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Image file is required");
        }
        String contentType = file.getContentType();
        String extension = resolveExtension(contentType);
        if (extension == null) {
            throw new ResponseStatusException(BAD_REQUEST, "Only PNG and JPG images are supported");
        }

        String fileName = storeFile(file, extension);
        int resolvedSortOrder = sortOrder == null ? 0 : sortOrder;
        boolean resolvedPrimary = Boolean.TRUE.equals(isPrimary);

        if (resolvedPrimary) {
            jdbcTemplate.update("UPDATE product_images SET is_primary = 0 WHERE product_id = ?", productId);
        }

        jdbcTemplate.update(
            """
            INSERT INTO product_images (product_id, file_path, title, alt_text, sort_order, is_primary)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            productId,
            fileName,
            title,
            altText,
            resolvedSortOrder,
            resolvedPrimary
        );

        Long id = jdbcTemplate.queryForObject("SELECT last_insert_rowid()", Long.class);
        if (id == null) {
            throw new IllegalStateException("Image insert failed");
        }
        return getImageById(id);
    }

    @Transactional
    public AdminProductImageView setPrimary(long imageId) {
        Long productId = jdbcTemplate.queryForObject(
            "SELECT product_id FROM product_images WHERE id = ?",
            Long.class,
            imageId
        );
        if (productId == null) {
            throw new ResponseStatusException(NOT_FOUND, "Image not found");
        }
        jdbcTemplate.update("UPDATE product_images SET is_primary = 0 WHERE product_id = ?", productId);
        jdbcTemplate.update("UPDATE product_images SET is_primary = 1 WHERE id = ?", imageId);
        return getImageById(imageId);
    }

    @Transactional
    public void deleteImage(long imageId) {
        List<String> rows = jdbcTemplate.query(
            "SELECT file_path FROM product_images WHERE id = ?",
            (rs, rowNum) -> rs.getString("file_path"),
            imageId
        );
        if (rows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Image not found");
        }
        String filePath = rows.getFirst();
        jdbcTemplate.update("DELETE FROM product_images WHERE id = ?", imageId);
        deleteFile(filePath);
    }

    private void ensureProductExists(long productId) {
        Integer exists = jdbcTemplate.queryForObject(
            "SELECT 1 FROM products WHERE id = ?",
            Integer.class,
            productId
        );
        if (exists == null) {
            throw new ResponseStatusException(NOT_FOUND, "Product not found");
        }
    }

    private AdminProductImageView getImageById(long imageId) {
        List<AdminProductImageView> rows = jdbcTemplate.query(
            """
            SELECT id, product_id, file_path, title, alt_text, sort_order, is_primary
            FROM product_images
            WHERE id = ?
            """,
            (rs, rowNum) -> new AdminProductImageView(
                rs.getLong("id"),
                rs.getLong("product_id"),
                rs.getString("file_path"),
                rs.getString("title"),
                rs.getString("alt_text"),
                rs.getInt("sort_order"),
                rs.getBoolean("is_primary"),
                toMediaUrl(rs.getString("file_path"))
            ),
            imageId
        );
        if (rows.isEmpty()) {
            throw new ResponseStatusException(NOT_FOUND, "Image not found");
        }
        return rows.getFirst();
    }

    private String storeFile(MultipartFile file, String extension) {
        try {
            Files.createDirectories(storagePath);
        } catch (IOException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Storage path unavailable");
        }

        String sanitizedExtension = extension.replaceAll("[^A-Za-z0-9.]", "");
        if (sanitizedExtension.isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid file extension");
        }

        String fileName = UUID.randomUUID().toString().replace("-", "") + extension.toLowerCase();
        Path target = storagePath.resolve(fileName).normalize();
        if (!target.startsWith(storagePath)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid file name");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Failed to store file");
        }

        return fileName;
    }

    private String resolveExtension(String contentType) {
        if (contentType == null) {
            return null;
        }
        String normalized = contentType.toLowerCase();
        if (normalized.equals("image/jpeg") || normalized.equals("image/jpg")) {
            return ".jpg";
        }
        if (normalized.equals("image/png")) {
            return ".png";
        }
        return null;
    }

    private void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return;
        }
        Path target = storagePath.resolve(filePath).normalize();
        if (!target.startsWith(storagePath)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // Best-effort cleanup
        }
    }

    private String toMediaUrl(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return null;
        }
        String fileName = filePath.replace("\\", "/");
        int lastSlash = fileName.lastIndexOf('/');
        if (lastSlash >= 0) {
            fileName = fileName.substring(lastSlash + 1);
        }
        return mediaBaseUrl + "/" + fileName;
    }

    private static String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "/media";
        }
        String trimmed = baseUrl.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }
}
