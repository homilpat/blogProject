package com.knowledge.blog.dto;

import com.knowledge.blog.validation.ValidPostContent;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class PostCreateRequest {
    @NotNull(message = "카테고리 ID는 필수입니다.")
    private Long categoryId;

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    private String summary;

    private String keyPoints;
    private String learningDirections;

    @ValidPostContent
    private String content;

    private String tags;
}
