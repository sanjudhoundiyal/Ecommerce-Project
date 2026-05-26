package com.E_commers.Controller;

import com.E_commers.Entity.Cart;
import com.E_commers.Service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/carts")
@CrossOrigin("*")
public class CartController {

    @Autowired
    private CartService cartService;

    // ✅ GET CART
    @GetMapping("/user/{userId}")
    public List<Cart> getCart(@PathVariable Long userId) {
        return cartService.getCartByUserId(userId);
    }





    @PostMapping("/add")
    public Cart addToCart(@RequestBody Map<String, Object> req) {

        System.out.println("REQ: " + req);

        Object userObj = req.get("userId");
        Object productObj = req.get("productId");
        Object quantityObj = req.get("quantity");
        Object sizeObj = req.get("size");

        if (userObj == null || productObj == null || quantityObj == null) {
            throw new RuntimeException("Missing required fields");
        }

        Long userId = Long.valueOf(userObj.toString());
        Long productId = Long.valueOf(productObj.toString());
        int quantity = Integer.parseInt(quantityObj.toString());

        // size optional handle
        String size = (sizeObj != null) ? sizeObj.toString() : "M";

        return cartService.addToCart(userId, productId, quantity, size);
    }

    // ✅ DELETE
    @DeleteMapping("/remove/{id}")
    public String remove(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return "Removed";
    }


    @PutMapping("/update/{id}")
    public Cart update(@PathVariable Long id, @RequestParam int quantity) {
        return cartService.updateQuantity(id, quantity);
    }
}