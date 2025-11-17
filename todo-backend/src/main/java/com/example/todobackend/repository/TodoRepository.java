package com.example.todobackend.repository;

import com.example.todobackend.model.Todo;
import com.example.todobackend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByOwnerOrderByCreatedAtDesc(AppUser owner);
}
