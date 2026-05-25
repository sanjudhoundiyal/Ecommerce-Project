package com.E_commers.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

@JsonIgnoreProperties({
        "hibernateLazyInitializer",
        "handler"
})
@Table(name = "master_product_details")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product__id")
    private Long id;
    private String deliveryDays;
    private String name;

    @Column(unique = true)
    private String slug;
    private double price;
    private int quantity;
    private double discount;
    @Column(nullable = false)
    private Double finalPrice;

    @Column(length = 5000)
    private String description;

    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subcategory_id")
//    @JsonIgnoreProperties("products") // Infinite loop se bachne ke liye
    private SubCategory subCategory;


    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CartItem> cartItems;

    @PrePersist
    @PreUpdate
    public void calculatePrice() {
        if (this.discount > 0) {
            this.finalPrice = this.price - (this.price * this.discount / 100);
        } else {
            this.finalPrice = this.price;
        }
    }

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private Seller seller;


    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

}