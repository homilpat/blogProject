package com.knowledge.blog.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImageStorageService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final int MAX_DIMENSION = 12_000;
    private static final Pattern MANAGED_IMAGE_PATTERN = Pattern.compile(
            "/uploads/([0-9a-fA-F-]{36}\\.(?:jpg|png|gif))(?:[?\"'#<\\s]|$)",
            Pattern.CASE_INSENSITIVE
    );
    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/gif", ".gif"
    );

    @Value("${uploads.directory}")
    private String uploadDirectory;

    private Path storagePath;

    @PostConstruct
    void initialize() throws IOException {
        storagePath = Path.of(uploadDirectory).toAbsolutePath().normalize();
        Files.createDirectories(storagePath);
    }

    public String store(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어 있습니다.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("이미지는 10MB 이하만 업로드할 수 있습니다.");
        }

        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException("JPG, PNG, GIF 이미지만 업로드할 수 있습니다.");
        }

        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null || image.getWidth() > MAX_DIMENSION || image.getHeight() > MAX_DIMENSION) {
            throw new IllegalArgumentException("올바른 이미지가 아니거나 이미지 크기가 너무 큽니다.");
        }

        String filename = UUID.randomUUID() + extension;
        Path target = storagePath.resolve(filename).normalize();
        if (!target.getParent().equals(storagePath)) {
            throw new IllegalArgumentException("올바르지 않은 파일 경로입니다.");
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        return filename;
    }

    public Set<String> findManagedImages(String content) {
        if (content == null || content.isBlank()) return Set.of();
        Matcher matcher = MANAGED_IMAGE_PATTERN.matcher(content);
        Set<String> filenames = matcher.results()
                .map(result -> result.group(1).toLowerCase())
                .collect(Collectors.toSet());
        return Set.copyOf(filenames);
    }

    public void delete(String filename) throws IOException {
        if (!filename.matches("[0-9a-fA-F-]{36}\\.(?:jpg|png|gif)")) {
            throw new IllegalArgumentException("올바르지 않은 이미지 파일명입니다.");
        }
        Path target = storagePath.resolve(filename).normalize();
        if (!target.getParent().equals(storagePath)) {
            throw new IllegalArgumentException("올바르지 않은 파일 경로입니다.");
        }
        Files.deleteIfExists(target);
    }
}
