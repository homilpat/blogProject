package com.knowledge.blog.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SavedConversation {
    private Long id;
    private Long userId;
    private String title;
    private String conversationJson;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
