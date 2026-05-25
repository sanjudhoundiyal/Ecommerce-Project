package com.E_commers.Controller;

import com.E_commers.Entity.Wishlist;
import com.E_commers.Service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin(origins = "*")

    public class WishlistController {

        @Autowired
        private WishlistService service;

    @PostMapping("/add")
    public String add(
            @RequestParam Long userId,
            @RequestParam Long productId,
            @RequestParam(required = false) String size
    ) {
        service.addToWishlist(userId, productId, size);
        return "Added to wishlist";
    }
        @GetMapping("/{userId}")
        public List<Wishlist> get(@PathVariable Long userId) {
            return service.getWishlist(userId);
        }

    @DeleteMapping("/remove")
    public String removeWishlist(
            @RequestParam Long userId,
            @RequestParam Long productId
    ) {

        service.removeWishlist(userId, productId);

        return "Removed successfully";
    }
    }

