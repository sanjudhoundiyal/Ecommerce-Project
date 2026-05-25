package com.E_commers.Entity;



import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;


@Setter
@Getter
public class Checkout
{
    private Long userId;
    private Double totalAmount;
    private String fullName;   // ✅ change this
    private String email;
    private Long phone;
    private String houseNo;
    private String street;
    private String area;
    private String landmark;
    private LocalDateTime orderDate;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String username;
    private  String image;

     private Address address;
    // ✅ ADD THIS
    private String deliveryDate;
    // getters setters
private User user;
    // getters setters
    private Long productId;

    private List<OrderItemRequest> orderItems;
}
