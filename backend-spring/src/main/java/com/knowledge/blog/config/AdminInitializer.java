package com.knowledge.blog.config;

import com.knowledge.blog.mapper.UserMapper;
import com.knowledge.blog.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements ApplicationRunner {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    @Value("${security.admin.username}") private String username;
    @Value("${security.admin.email}") private String email;
    @Value("${security.admin.password}") private String password;

    @Override public void run(ApplicationArguments args) {
        if (userMapper.findByUsername(username) != null) return;
        User admin = new User();
        admin.setUsername(username);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole("ROLE_ADMIN");
        userMapper.insert(admin);
    }
}
