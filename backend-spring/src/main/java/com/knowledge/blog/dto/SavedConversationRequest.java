package com.knowledge.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SavedConversationRequest {
    @NotBlank(message = "대화 제목은 필수입니다.")
    @Size(max = 255, message = "대화 제목은 255자 이하여야 합니다.")
    private String title;

    @NotBlank(message = "저장할 대화 내용이 없습니다.")
    @Size(max = 1000000, message = "대화 기록은 1MB 이하여야 합니다.")
    private String conversationJson;
}
