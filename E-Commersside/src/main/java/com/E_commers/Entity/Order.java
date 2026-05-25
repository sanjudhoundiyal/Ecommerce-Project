package com.E_commers.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Table(name = "user_OrderDetails")
@Entity
@Setter
@Getter
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String paymentStatus;
    private double totalAmount;
    private LocalDateTime orderDate; // Order date
    @Column(name = "delivery_date")

    private String deliveryDate;
    private double finalPrice;
    private String transactionId;
    private String username;
    private String status;
    private Long userId;   // ✅ required
    private  String image;


    @ManyToOne

    @JsonIgnore
    @JoinColumn(name = "user_user_id")
    private User user;


    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;

    @OneToMany(mappedBy = "order",
            cascade = CascadeType.ALL,
            fetch = FetchType.EAGER)

    @JsonManagedReference
    private List<OrderItem> orderItems;



}

