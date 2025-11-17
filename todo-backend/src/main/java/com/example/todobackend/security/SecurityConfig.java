package com.example.todobackend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Nếu chưa cần CSRF thì tắt để đỡ lỗi 403 khi POST/PUT trong giai đoạn dev
                .csrf(csrf -> csrf.disable())

                // CORS cho frontend chạy ở localhost:5173/5174
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // H2 console cần mở frame options
                .headers(h -> h.frameOptions(f -> f.disable()))

                .authorizeHttpRequests(auth -> auth
                        // OPTIONS cho preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Cho phép các API public (đăng nhập/đăng ký), H2 console
                        .requestMatchers("/api/auth/**", "/h2-console/**").permitAll()

                        // (Dev) Cho phép hết /api/**. Nếu muốn bảo vệ, đổi .permitAll() -> .authenticated()
                        .requestMatchers("/api/**").permitAll()

                        // Các route còn lại
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    // Quan trọng để AuthController dùng: passwordEncoder.encode / matches
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS cho Vite
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();

        // Khi allowCredentials = true, dùng allowedOriginPatterns là tiện nhất trong dev
        c.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));

        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));

        // Nếu frontend/axios dùng Authorization/Bearer, để browser có thể đọc header này
        c.setExposedHeaders(List.of("Authorization", "Content-Disposition"));

        // Nếu bạn cần gửi cookie/Authorization từ browser => true
        c.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}
