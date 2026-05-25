package com.E_commers.Service;

import com.E_commers.Entity.Order;
import com.E_commers.Entity.Payment;
import com.E_commers.Repository.OrderRepo;
import com.E_commers.Repository.PaymentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepo paymentRepo;

    @Autowired
    private OrderRepo orderRepo;

    // ✅ GET ALL PAYMENTS
    public List<Payment> getAllPayments() {
        return paymentRepo.findAll();
    }

    // ✅ SAVE PAYMENT
    public Payment savePayment(Long orderId, String method, String status, String txn) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found ❌"));

        // ✅ duplicate update रोको
        if ("PAID".equals(order.getStatus())) {
            throw new RuntimeException("Order already paid ❌");
        }

        if ("SUCCESS".equals(status)) {
            order.setStatus("PAID");
        } else {
            order.setStatus("FAILED");
        }

        orderRepo.save(order);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(method);
        payment.setStatus(status);
        payment.setTransaction(txn);

        return paymentRepo.save(payment);
    }



}