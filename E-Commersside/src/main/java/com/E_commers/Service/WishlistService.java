package com.E_commers.Service;


import com.E_commers.Entity.Product;
import com.E_commers.Entity.Wishlist;
import com.E_commers.Repository.ProductRepo;
import com.E_commers.Repository.WishlistRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class WishlistService {

@Autowired
private WishlistRepo repo;

@Autowired
private ProductRepo productRepo;

    public void addToWishlist(Long userId, Long productId, String size) {

        if (repo.findByUserIdAndProductId(userId, productId).isEmpty()) {

            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Wishlist w = new Wishlist();

            w.setUserId(userId);

            w.setProductId(productId);

            w.setSize(size);


            w.setName(product.getName());

            w.setPrice(product.getPrice());

            w.setImageUrl(product.getImageUrl());

            repo.save(w);
        }
    }
    public List<Wishlist> getWishlist(Long userId) {

        List<Wishlist> wishlist = repo.findByUserId(userId);

        return wishlist.stream().map(w -> {

            Product p = productRepo.findById(w.getProductId()).orElse(null);

            Wishlist dto = new Wishlist();

            dto.setId(w.getId());
            dto.setProductId(w.getProductId());
            dto.setSize(w.getSize());   // ✅ ADD THIS LINE

            if (p != null) {
                dto.setName(p.getName());
                dto.setImageUrl(p.getImageUrl());
                dto.setPrice(p.getPrice());
            }

            return dto;

        }).toList();
    }

    public void removeWishlist(Long userId, Long productId) {

        Wishlist wishlist = repo.findFirstByUserIdAndProductId(
                userId,
                productId
        );

        // if item exists then delete
        if (wishlist != null) {

            repo.delete(wishlist);

        } else {

            System.out.println("Wishlist item not found");
        }

    }











}
