package com.knowledge.blog.controller;

import com.knowledge.blog.dto.SavedConversationRequest;
import com.knowledge.blog.model.SavedConversation;
import com.knowledge.blog.service.SavedConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class SavedConversationController {
    private final SavedConversationService service;

    private Long userId(Jwt jwt) {
        return ((Number) jwt.getClaim("userId")).longValue();
    }

    @GetMapping
    public ResponseEntity<List<SavedConversation>> findAll(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(service.findAll(userId(jwt)));
    }

    @PostMapping
    public ResponseEntity<SavedConversation> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SavedConversationRequest request) {
        return ResponseEntity.ok(service.create(userId(jwt), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SavedConversation> update(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @Valid @RequestBody SavedConversationRequest request) {
        SavedConversation updated = service.update(id, userId(jwt), request);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return service.delete(id, userId(jwt)) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
