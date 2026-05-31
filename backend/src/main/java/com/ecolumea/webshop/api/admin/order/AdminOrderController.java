package com.ecolumea.webshop.api.admin.order;

import com.ecolumea.webshop.api.auth.AdminAuthorizationService;
import jakarta.validation.Valid;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;
    private final AdminAuthorizationService adminAuthorizationService;

    public AdminOrderController(AdminOrderService adminOrderService, AdminAuthorizationService adminAuthorizationService) {
        this.adminOrderService = adminOrderService;
        this.adminAuthorizationService = adminAuthorizationService;
    }

    @GetMapping
    public List<AdminOrderListItem> listOrders(@RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_ORDER", "SUPER_ADMIN");
        return adminOrderService.getOrders();
    }

    @GetMapping("/{id}")
    public AdminOrderDetailResponse getOrder(@PathVariable long id, @RequestHeader("X-Auth-Token") String authToken) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_ORDER", "SUPER_ADMIN");
        return adminOrderService.getOrderById(id);
    }

    @PatchMapping("/{id}/status")
    public AdminOrderDetailResponse updateOrderStatus(
            @PathVariable long id,
            @Valid @RequestBody AdminUpdateOrderStatusRequest request,
            @RequestHeader("X-Auth-Token") String authToken
    ) {
        adminAuthorizationService.requireAnyRole(authToken, "ADMIN_ORDER", "SUPER_ADMIN");
        return adminOrderService.updateOrderStatus(id, request.orderStatus());
    }
}
