package com.knowledge.blog.controller;

import com.knowledge.blog.dto.PostCreateRequest;
import com.knowledge.blog.model.Post;
import com.knowledge.blog.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<Post>> getPosts(
            @RequestParam(required = false) String section,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(postService.getPosts(section, categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable Long id) {
        Post post = postService.getPostById(id);
        if (post == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@Valid @RequestBody PostCreateRequest request) {
        Post created = postService.createPost(request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable Long id, @Valid @RequestBody PostCreateRequest request) {
        Post updated = postService.updatePost(id, request);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        return postService.deletePost(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/reindex")
    public ResponseEntity<Void> reindexPost(@PathVariable Long id) {
        return postService.reindexPost(id) ? ResponseEntity.accepted().build() : ResponseEntity.notFound().build();
    }
}
