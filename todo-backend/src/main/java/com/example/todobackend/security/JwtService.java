package com.example.todobackend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    // Khóa bí mật (dùng tạm khi DEV)
    private final Key key = Keys.hmacShaKeyFor(
            "super-secret-key-super-secret-key-1234567890".getBytes()
    );

    // Token hết hạn sau 24h
    private final long EXP = 1000L * 60 * 60 * 24;

    // Tạo JWT từ username
    public String generate(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXP))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // Giải mã lấy username từ token
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
}
