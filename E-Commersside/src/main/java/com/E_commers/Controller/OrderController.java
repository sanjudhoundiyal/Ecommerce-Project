package com.E_commers.Controller;

import com.E_commers.Entity.Order;
import com.E_commers.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public Order createOrder(
            @RequestParam Long userId,
            @RequestParam(required = false) Long adminId,
            @RequestBody Order order
    ) {
        return orderService.createOrder(userId, adminId, order);
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderService.getAllShowOrder();
    }

    // ✅ 🔥 FIXED: GET ORDERS BY USER ID
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Long userId) {
        return orderService.getOrdersByUserId(userId);
    }



    @PutMapping("/{id}")
    public Order updateOrder(@PathVariable Long id,
                             @RequestBody Order order) {
        return orderService.updateOrder(id, order);
    }

    @GetMapping("/{id}")
    public Order getOrderById1(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PutMapping("/cancel/{id}")
    public String cancelOrder(@PathVariable Long id) {

        return orderService.cancelOrder(id);
    }


        @DeleteMapping("/cancel-item/{orderItemId}")
    public ResponseEntity<?> cancelOrderItem(
            @PathVariable Long orderItemId) {

        orderService.cancelOrderItem(orderItemId);

        return ResponseEntity.ok("Item cancelled successfully");
    }




    @PutMapping("/status/update")
    public ResponseEntity<?> updateOrderStatus(@RequestBody Map<String, String> body) {

        Long orderId = Long.parseLong(body.get("orderId"));
        String status = body.get("status");

        Order updatedOrder = orderService.updateOrderStatus(orderId, status);

        return ResponseEntity.ok(updatedOrder);
    }
}