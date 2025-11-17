package com.example.todobackend.controller;

import com.example.todobackend.model.AppUser;
import com.example.todobackend.model.Todo;
import com.example.todobackend.repository.TodoRepository;
import com.example.todobackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoRepository repository;
    private final UserRepository users;

    public TodoController(TodoRepository repository, UserRepository users) {
        this.repository = repository;
        this.users = users;
    }

    // Lấy user hiện tại từ SecurityContext
    private AppUser me() {
        String username = (String) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return users.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // Lấy toàn bộ Todo của user
    @GetMapping
    public List<Todo> getAllTodos() {
        return repository.findByOwnerOrderByCreatedAtDesc(me());
    }

    // Tạo Todo mới, gán owner = user hiện tại
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Todo create(@RequestBody Todo req) {
        req.setOwner(me());
        return repository.save(req);
    }

    // Cập nhật Todo
    @PutMapping("/{id}")
    public Todo update(@PathVariable Long id, @RequestBody Todo req) {
        Todo t = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found"));
        if (!t.getOwner().getId().equals(me().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your todo");
        }
        t.setTitle(req.getTitle());
        t.setCompleted(req.isCompleted());
        t.setDueDate(req.getDueDate());
        return repository.save(t);
    }

    // Toggle completed
    @PatchMapping("/{id}/toggle")
    public Todo toggle(@PathVariable Long id) {
        Todo t = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found"));
        if (!t.getOwner().getId().equals(me().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your todo");
        }
        t.setCompleted(!t.isCompleted());
        return repository.save(t);
    }

    // Xóa Todo
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        Todo t = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Todo not found"));
        if (!t.getOwner().getId().equals(me().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your todo");
        }
        repository.delete(t);
    }
}
