package com.knowledge.blog.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Post {
    private Long id;
    private Long categoryId;
    private String title;
    private String summary;
    private String keyPoints;
    private String learningDirections;
    private String content;
    private String tags;
    private Long authorId;
    private Boolean isPublished;
    private Integer viewCount;
    private Boolean isIndexedInRag;
    private LocalDateTime indexedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String categoryName;
    private String categorySection;
}
