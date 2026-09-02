package com.knowledge.blog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryCreateRequest {
    @NotBlank(message = "카테고리 코드는 필수입니다.")
    private String code;

    @NotBlank(message = "카테고리 이름은 필수입니다.")
    private String name;

    @NotBlank(message = "RAG 분류 키는 필수입니다.")
    private String section;

    private String description;
}
