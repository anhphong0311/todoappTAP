package com.example.todobackend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173","http://127.0.0.1:5173","http://localhost:5174"})
public class AuthController {

    record LoginRequest(String username, String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        // DEMO: hard-code kiểm tra, sau thay bằng UserService + PasswordEncoder
        if ("Tranhphong0311".equalsIgnoreCase(req.username()) && "123456".equals(req.password())) {
            String token = UUID.randomUUID().toString();
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", req.username()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Sai tài khoản hoặc mật khẩu"));
    }
}
