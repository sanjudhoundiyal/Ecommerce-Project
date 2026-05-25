package com.E_commers.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Wishlist {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String imageUrl;   // ✅ ADD THIS
    private Double price;
    private String name;
    private Long userId;

    @Column(name = "product_id")
    private Long productId;
    private String size;



    @ManyToOne
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;
}
