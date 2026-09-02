package com.knowledge.blog.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Category {
    private Long id;
    private String code;
    private String name;
    private String section;
    private String description;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
