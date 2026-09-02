package com.knowledge.blog.mapper;

import com.knowledge.blog.model.Post;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PostMapper {
    List<Post> findAll(@Param("section") String section, @Param("categoryId") Long categoryId);
    Post findById(Long id);
    int insert(Post post);
    int update(Post post);
    int delete(Long id);
    int incrementViewCount(Long id);
    int updateRagIndexStatus(@Param("id") Long id, @Param("isIndexed") Boolean isIndexed);
    int countImageReferences(@Param("filename") String filename, @Param("excludePostId") Long excludePostId);
}
