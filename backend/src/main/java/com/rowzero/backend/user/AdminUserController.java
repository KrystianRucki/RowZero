package com.rowzero.backend.user;

import com.rowzero.backend.user.dto.AdminUserPageResponse;
import com.rowzero.backend.user.dto.AdminUserResponse;
import com.rowzero.backend.user.dto.UpdateUserStatusRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@Validated
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(
            AdminUserService adminUserService
    ) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public AdminUserPageResponse getUsers(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            Boolean enabled,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        return adminUserService.getUsers(
                search,
                enabled,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public AdminUserResponse getUser(
            @PathVariable Long id
    ) {
        return adminUserService.getUser(id);
    }

    @PatchMapping("/{id}")
    public AdminUserResponse updateUser(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateUserStatusRequest request
    ) {
        return adminUserService.updateEnabled(
                id,
                request.enabled()
        );
    }
}