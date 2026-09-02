CREATE DATABASE IF NOT EXISTS blog_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blog_db;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    section VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary VARCHAR(500),
    key_points TEXT,
    learning_directions TEXT,
    content LONGTEXT NOT NULL,
    tags VARCHAR(255),
    author_id BIGINT DEFAULT 1,
    is_published BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    is_indexed_in_rag BOOLEAN DEFAULT FALSE,
    indexed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0,
    doc_type VARCHAR(50) NOT NULL,
    domain_category VARCHAR(50) DEFAULT 'PROCESS',
    chunk_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS search_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    query VARCHAR(1000) NOT NULL,
    answer LONGTEXT,
    sources_json JSON,
    domain_filter VARCHAR(50),
    response_time_ms INT,
    user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS saved_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    conversation_json LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_saved_conversations_user_created (user_id, created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categories (code, name, section, description, display_order) VALUES
('semi_process', '공정 기술', 'PROCESS', '노광, 식각, 박막, 세정, 확산 공정 지식', 1),
('semi_equipment', '장비/설비', 'EQUIPMENT', '챔버, 진공계, RF, MFC 및 설비 점검 지식', 2),
('semi_troubleshoot', '알람 & 트러블슈팅', 'TROUBLESHOOT', '알람 원인 분석과 결함 조치 지식', 3),
('semi_yield_metro', '수율 & 계측', 'YIELD_METRO', '수율 분석, 계측 및 결함 검사 지식', 4),
('ai_rag_tech', 'AI & RAG 엔지니어링', 'AI_TECH', 'RAG, 임베딩, Vector DB와 LLM 기술', 5),
('project_log', '오늘의 학습 내용', 'PROJECT_LOG', '오늘 학습하거나 실습한 내용, 새롭게 이해한 개념과 작업 회고', 6)
ON DUPLICATE KEY UPDATE
name = VALUES(name), description = VALUES(description), display_order = VALUES(display_order);
