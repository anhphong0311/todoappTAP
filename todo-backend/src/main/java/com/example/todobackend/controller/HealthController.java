// src/main/java/com/example/todobackend/controller/HealthController.java
package com.example.todobackend.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class HealthController {
    @GetMapping("/api/health")
    public String ok() { return "OK"; }
}
