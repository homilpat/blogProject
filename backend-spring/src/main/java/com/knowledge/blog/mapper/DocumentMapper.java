package com.knowledge.blog.mapper;

import com.knowledge.blog.model.DocumentMeta;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface DocumentMapper {
    List<DocumentMeta> findAll();
    DocumentMeta findById(Long id);
    int insert(DocumentMeta doc);
    int updateStatus(DocumentMeta doc);
}
