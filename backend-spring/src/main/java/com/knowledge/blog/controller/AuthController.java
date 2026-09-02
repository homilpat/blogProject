package com.knowledge.blog.controller;

import com.knowledge.blog.mapper.UserMapper;
import com.knowledge.blog.model.User;
import com.knowledge.blog.service.TokenService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userMapper.findByUsername(request.getUsername().trim());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "아이디 또는 비밀번호가 올바르지 않습니다."));
        }
        return ResponseEntity.ok(toResponse(user));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (userMapper.findByUsername(request.getUsername().trim()) != null || userMapper.findByEmail(request.getEmail().trim()) != null) {
            return ResponseEntity.status(409).body(Map.of("message", "이미 사용 중인 아이디 또는 이메일입니다."));
        }
        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        userMapper.insert(user);
        return ResponseEntity.status(201).body(toResponse(user));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        User user = userMapper.findByUsername(authentication.getName());
        return user == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(Map.of("username", user.getUsername(), "email", user.getEmail(), "role", user.getRole()));
    }

    private Map<String, Object> toResponse(User user) {
        return Map.of("token", tokenService.issue(user), "username", user.getUsername(), "email", user.getEmail(), "role", user.getRole());
    }

    @Data public static class LoginRequest { @NotBlank private String username; @NotBlank private String password; }
    @Data public static class RegisterRequest { @NotBlank @Size(min=3,max=50) private String username; @NotBlank @Email private String email; @NotBlank @Size(min=10,max=100) private String password; }
}
