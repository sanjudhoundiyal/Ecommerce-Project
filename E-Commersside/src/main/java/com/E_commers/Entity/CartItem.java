package com.E_commers.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name="user_CartItems")
public class CartItem {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String productName; // UI ke liye
    private String imageUrl;    // Product image
    private int quantity;
    private double price;      // Per product price
    private double totalPrice; // quantity * price
    @ManyToOne
    private Cart cart;

    @ManyToOne

    private Product product;
}
