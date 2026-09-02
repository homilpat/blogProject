package com.knowledge.blog.service;

import com.knowledge.blog.dto.SavedConversationRequest;
import com.knowledge.blog.mapper.SavedConversationMapper;
import com.knowledge.blog.model.SavedConversation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedConversationService {
    private final SavedConversationMapper mapper;

    public List<SavedConversation> findAll(Long userId) {
        return mapper.findAllByUserId(userId);
    }

    public SavedConversation create(Long userId, SavedConversationRequest request) {
        SavedConversation conversation = new SavedConversation();
        conversation.setUserId(userId);
        conversation.setTitle(request.getTitle().trim());
        conversation.setConversationJson(request.getConversationJson());
        mapper.insert(conversation);
        return mapper.findByIdAndUserId(conversation.getId(), userId);
    }

    public SavedConversation update(Long id, Long userId, SavedConversationRequest request) {
        SavedConversation conversation = new SavedConversation();
        conversation.setId(id);
        conversation.setUserId(userId);
        conversation.setTitle(request.getTitle().trim());
        conversation.setConversationJson(request.getConversationJson());
        return mapper.update(conversation) > 0 ? mapper.findByIdAndUserId(id, userId) : null;
    }

    public boolean delete(Long id, Long userId) {
        return mapper.deleteByIdAndUserId(id, userId) > 0;
    }
}
