package com.E_commers.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🔥 MAP WITH USER
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // 🔥 MAP WITH PRODUCT
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    private int rating;
    private String comment;

    private LocalDateTime createdAt = LocalDateTime.now();

    // getters setters
}