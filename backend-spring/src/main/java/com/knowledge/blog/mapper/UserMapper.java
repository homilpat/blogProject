package com.knowledge.blog.mapper;

import com.knowledge.blog.model.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper {
    User findByUsername(String username);
    User findByEmail(String email);
    int insert(User user);
}
