package com.knowledge.blog.mapper;

import com.knowledge.blog.model.Category;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface CategoryMapper {
    List<Category> findAll();
    Category findById(Long id);
    Category findByCode(String code);
    int insert(Category category);
}
