package com.knowledge.blog;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.knowledge.blog.mapper")
public class KnowledgeBlogApplication {
    public static void main(String[] args) {
        SpringApplication.run(KnowledgeBlogApplication.class, args);
    }
}
