package com.knowledge.blog.controller;

import com.knowledge.blog.dto.CategoryCreateRequest;
import com.knowledge.blog.mapper.CategoryMapper;
import com.knowledge.blog.model.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryMapper categoryMapper;

    @GetMapping
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(categoryMapper.findAll());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@jakarta.validation.Valid @RequestBody CategoryCreateRequest request) {
        if (categoryMapper.findByCode(request.getCode()) != null) {
            return ResponseEntity.status(409).build();
        }

        Category category = new Category();
        category.setCode(request.getCode().trim().toLowerCase());
        category.setName(request.getName().trim());
        category.setSection(request.getSection().trim().toUpperCase());
        category.setDescription(request.getDescription());
        categoryMapper.insert(category);
        return ResponseEntity.status(201).body(categoryMapper.findById(category.getId()));
    }
}
