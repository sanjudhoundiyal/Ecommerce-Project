package com.E_commers.Repository;

import com.E_commers.Entity.Cart;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepo extends JpaRepository<Cart, Long> {



    Optional<Cart> findByUser_IdAndProduct_IdAndSize(Long userId, Long productId, String size);
    List<Cart> findByUser_Id(Long userId);


    @Modifying
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_shopping_cart WHERE product_id = :productId", nativeQuery = true)
    void deleteByProductId(@Param("productId") Long productId);



    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM user_shopping_cart
        WHERE product_id IN (
            SELECT product__id
            FROM master_product_details
            WHERE seller_id = :sellerId
        )
        """, nativeQuery = true)
    void deleteCartItemsBySellerId(@Param("sellerId") Long sellerId);
}









