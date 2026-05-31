package com.ecolumea.webshop.api.admin.user;

import com.ecolumea.webshop.api.auth.AdminAuthorizationService;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AdminAuthorizationService adminAuthorizationService;

    public AdminUserController(AdminUserService adminUserService, AdminAuthorizationService adminAuthorizationService) {
        this.adminUserService = adminUserService;
        this.adminAuthorizationService = adminAuthorizationService;
    }

    @GetMapping
    public List<AdminUserSummary> listUsers(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "SUPER_ADMIN");
        return adminUserService.listUsers();
    }

    @GetMapping("/roles")
    public List<AdminRoleSummary> listRoles(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "SUPER_ADMIN");
        return adminUserService.listRoles();
    }

    @PostMapping("/{id}/reset-password")
    public AdminPasswordResetResponse resetPassword(@PathVariable long id, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "SUPER_ADMIN");
        return adminUserService.resetPassword(id);
    }

    @PostMapping("/{id}/roles/{roleCode}")
    public AdminUserSummary assignRole(
            @PathVariable long id,
            @PathVariable String roleCode,
            @RequestHeader("X-Auth-Token") String authToken
    ) {
        long actorUserId = adminAuthorizationService.requireAnyRole(authToken, "SUPER_ADMIN");
        return adminUserService.assignRole(actorUserId, id, roleCode);
    }

    @DeleteMapping("/{id}/roles/{roleCode}")
    public AdminUserSummary removeRole(
            @PathVariable long id,
            @PathVariable String roleCode,
            @RequestHeader("X-Auth-Token") String authToken
    ) {
        long actorUserId = adminAuthorizationService.requireAnyRole(authToken, "SUPER_ADMIN");
        return adminUserService.removeRole(actorUserId, id, roleCode);
    }
}
