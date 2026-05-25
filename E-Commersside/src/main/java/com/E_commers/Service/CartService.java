package com.E_commers.Service;

import com.E_commers.Entity.Cart;
import com.E_commers.Entity.Product;
import com.E_commers.Entity.User;
import com.E_commers.Repository.CartRepo;
import com.E_commers.Repository.ProductRepo;
import com.E_commers.Repository.Userrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private Userrepo userRepo;

    // ✅ GET CART
    public List<Cart> getCartByUserId(Long userId) {
        return cartRepo.findByUser_Id(userId);
    }

    // ✅ ADD TO CART
    public Cart addToCart(Long userId, Long productId, int quantity, String size) {



        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Cart cart = new Cart();

        cart.setUser(user);
        cart.setProduct(product);
        cart.setQuantity(quantity);
        cart.setSize(size);

        // ✅ FIX START
        cart.setPrice(product.getPrice()); // single price
        cart.setTotalPrice(product.getPrice() * quantity); // total
        // ✅ FIX END

        return cartRepo.save(cart);
    }

    // ✅ REMOVE
    public void removeFromCart(Long id) {
        cartRepo.deleteById(id);
    }

    // ✅ UPDATE
    public Cart updateQuantity(Long id, int quantity) {

        Cart cart = cartRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart not found"));



        cart.setQuantity(quantity);
        cart.setTotalItems(quantity);
        cart.setTotalPrice(quantity * cart.getPrice());

        return cartRepo.save(cart);
    }
}