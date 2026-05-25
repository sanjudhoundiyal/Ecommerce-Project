package com.E_commers.Service;

import com.E_commers.Entity.*;
import com.E_commers.Repository.AdminRepo;
import com.E_commers.Repository.OrderRepo;
import com.E_commers.Repository.Userrepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;


@Service
public class OrderService {


    @Autowired
    private OrderRepo orderRepo;

    @Autowired
    private Userrepo userrepo;

    @Autowired
    private AdminRepo adminRepo;

    @Autowired
    private com.E_commers.Repository.OrderItem orderItem;

    //Admin Access code
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
//


    //User to access

    public Order createOrder(Long userId, Long adminId, Order order) {

        User user = userrepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        order.setUser(user);


        if (adminId != null) {
            Admin admin = adminRepo.findById(adminId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

        }


        // 💳 Default Payment Status
        order.setPaymentStatus("PENDING");

        return orderRepo.save(order);
    }

    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepo.findByUser_Id(userId);
    }

    public Order getOrderById1(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }


    public List<Order> getAllShowOrder() {

        return orderRepo.findAll();
    }

    public Order getOrderById(Long id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }


    public Order updateOrder(Long id, Order newOrder) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setPaymentStatus(newOrder.getPaymentStatus());
        order.setTotalAmount(newOrder.getTotalAmount());
        order.setDeliveryDate(newOrder.getDeliveryDate());

        return orderRepo.save(order);
    }

    public String cancelOrder(Long id) {

        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // already cancelled
        if ("CANCELLED".equals(order.getStatus())) {
            return "Order already cancelled";
        }

        // delivered order cannot cancel
        if ("DELIVERED".equals(order.getStatus())) {
            return "Delivered order cannot be cancelled";
        }

        // change status
        order.setStatus("CANCELLED");

        orderRepo.save(order);

        return "Order cancelled successfully";
    }

    public Order setOrder(Order order) {

        return orderRepo.save(order);
    }


    @Transactional
    public void cancelOrderItem(Long orderItemId) {

        OrderItem item = orderItem.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));



        item.setStatus("CANCELLED");
        Order order = item.getOrder();

        // Order ke list se item remove karo
        order.getOrderItems().remove(item);

        // item delete karo
        orderItem.delete(item);

        // Agar saare items delete ho gaye to order bhi cancel
        if (order.getOrderItems().isEmpty()) {
            order.setStatus("CANCELLED");
        }

        orderRepo.save(order);
    }


    public Order updateOrderStatus(Long orderId, String status) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);

        return orderRepo.save(order);
    }
}
