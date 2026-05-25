package com.E_commers.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Banner Image
    private String imageUrl;

    // Banner Title
    private String title;

    // Subtitle
    private String subtitle;

    // Description
    @Column(length = 1000)
    private String description;

    // Offer Text
    private String offerText;

    // Redirect Link
    private String buttonLink;


    // Category
    private String category;

    // Brand
    private String brand;

    // Banner Type
    private String bannerType;

    // ================= PRODUCT FIELDS =================

    // Product Id
    private Long productId;

    // Product Name
    private String productName;

    // Product Slug
    private String productSlug;

    // Product Price
    private Double productPrice;

    // Product Main Image
    private String productImage;
}