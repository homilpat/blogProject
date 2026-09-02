package com.knowledge.blog.mapper;

import com.knowledge.blog.model.SavedConversation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SavedConversationMapper {
    List<SavedConversation> findAllByUserId(Long userId);
    SavedConversation findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
    int insert(SavedConversation conversation);
    int update(SavedConversation conversation);
    int deleteByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);
}
