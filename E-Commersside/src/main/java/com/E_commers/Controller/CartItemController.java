package com.E_commers.Controller;
import com.E_commers.Entity.CartItem;
import com.E_commers.Service.CardItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
@CrossOrigin(origins = "*")
public class CartItemController {

    @Autowired
    private CardItemService cardItemService;
;

    @PostMapping("/add")
    public CartItem addToCart(
            @RequestParam Long cartId,
            @RequestParam Long productId,
            @RequestParam int quantity
    ) {
        return cardItemService.addToCart(cartId, productId, quantity);
    }


    @GetMapping
    public List<CartItem> getAllCartItems() {
        return cardItemService.getAllCartItems();
    }


    @GetMapping("/{id}")
    public CartItem getCartItem(@PathVariable Long id) {
        return cardItemService.getCartItemById(id);
    }


    @PutMapping("/{id}")
    public CartItem updateQuantity(
            @PathVariable Long id,
            @RequestParam int quantity
    ) {
        return cardItemService.updateQuantity(id, quantity);
    }

    @DeleteMapping("/{id}")
    public String deleteCartItem(@PathVariable Long id) {
        cardItemService.removeCartItem(id);
        return "Cart item removed successfully";
    }
}








