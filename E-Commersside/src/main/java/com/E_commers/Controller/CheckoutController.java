package com.E_commers.Controller;

import com.E_commers.Entity.*;
import com.E_commers.Repository.AddressREpo;
import com.E_commers.Repository.OrderRepo;
import com.E_commers.Repository.ProductRepo;
import com.E_commers.Repository.Userrepo;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.tool.schema.internal.exec.ScriptTargetOutputToFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/checkout")
@CrossOrigin("*")
public class CheckoutController {

    @Autowired
    private AddressREpo addressRepo;

    @Autowired
    private OrderRepo orderRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private Userrepo userRepo;

    private List<OrderItemRequest> orderItems;

    @PostMapping
    public Order placeOrder(@RequestBody Checkout req) {

        if (req.getUserId() == null || req.getOrderItems() == null || req.getOrderItems().isEmpty()) {
            throw new RuntimeException("Invalid request");
        }

        // ✅ USER
        User user = userRepo.findById(req.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ✅ ADDRESS
        Address address = new Address();
        address.setName(req.getFullName());
        address.setEmail(req.getEmail());
        address.setPhone(req.getPhone());
        address.setHouseNo(req.getHouseNo());
        address.setStreet(req.getStreet());
        address.setArea(req.getArea());
        address.setLandmark(req.getLandmark());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setCountry(req.getCountry());
        address.setPincode(req.getPincode());
        address.setUser(user);

        Address savedAddress = addressRepo.save(address);

        // ✅ ORDER
        Order order = new Order();
        order.setUser(user);
        order.setUsername(req.getFullName());
        order.setTotalAmount(req.getTotalAmount());
        order.setStatus("PENDING");
        order.setImage(req.getImage());
        order.setOrderDate(LocalDateTime.now());
        order.setAddress(savedAddress);
        order.setUsername(
                req.getFullName() != null && !req.getFullName().isEmpty()
                        ? req.getFullName()
                        : user.getName()
        );

        List<OrderItem> items = new ArrayList<>();

        // 🔥 DELIVERY STRING FROM PRODUCT
        String deliveryText = null;

        for (OrderItemRequest itemReq : req.getOrderItems()) {

            Product product = productRepo.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // ✅ product se delivery uthao
            if (product.getDeliveryDays() != null) {
                deliveryText = product.getDeliveryDays();
                // example: "Delivery in 2-4 days"
            }

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            System.out.println(product);
            item.setQuantity(itemReq.getQuantity());

            item.setPrice(itemReq.getPrice());

            item.setOrder(order);

            item.setSeller(product.getSeller());

            items.add(item);
        }

        // 🔥 FINAL SET (STRING)
        order.setDeliveryDate(deliveryText);
        Product firstProduct = items.get(0).getProduct();

        order.setImage(firstProduct.getImageUrl());


        order.setOrderItems(items);

        return orderRepo.save(order);
    }
}