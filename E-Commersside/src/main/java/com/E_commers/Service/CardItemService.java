package com.E_commers.Service;

import com.E_commers.Entity.Cart;
import com.E_commers.Entity.CartItem;
import com.E_commers.Entity.Product;
import com.E_commers.Repository.CardItemRepo;
import com.E_commers.Repository.CartRepo;
import com.E_commers.Repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
     public class CardItemService {

        @Autowired
        private CardItemRepo cardItemRepo;

        @Autowired
        private ProductRepo productRepo;

        @Autowired
        private CartRepo cartRepo;

        public CartItem addToCart(Long cartId, Long productId, int quantity)
        {



            Cart cart = cartRepo.findById(cartId)
                    .orElseThrow(() -> new RuntimeException("Cart not found"));

            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);

            item.setProductName(product.getName());
            item.setPrice(product.getPrice());
            item.setTotalPrice(product.getPrice() * quantity);



            return cardItemRepo.save(item);









        }




        public List<CartItem> getAllCartItems() {
            return cardItemRepo.findAll();
        }

        // 🔍 Get CartItem by ID
        public CartItem getCartItemById(Long id) {
            return cardItemRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("CartItem not found"));
        }

        // ✏ Update Quantity
        public CartItem updateQuantity(Long id, int quantity) {
            CartItem item = cardItemRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("CartItem not found"));

            item.setQuantity(quantity);
            item.setTotalPrice(item.getPrice() * quantity);

            return cardItemRepo.save(item);
        }

        public void removeCartItem(Long id) {
            cardItemRepo.deleteById(id);
        }
    }



