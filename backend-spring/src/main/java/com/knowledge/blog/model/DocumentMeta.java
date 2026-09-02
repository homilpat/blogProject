package com.knowledge.blog.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DocumentMeta {
    private Long id;
    private String title;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String docType;
    private String domainCategory;
    private Integer chunkCount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
