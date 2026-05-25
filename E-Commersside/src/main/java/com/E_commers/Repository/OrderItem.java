package com.E_commers.Repository;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface OrderItem extends JpaRepository<com.E_commers.Entity.OrderItem,Long> {

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_order_items WHERE product_id = :productId", nativeQuery = true)
    void deleteByProductId(@Param("productId") Long productId);


    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM user_order_items
        WHERE product_product__id IN (
            SELECT product__id
            FROM master_product_details
            WHERE seller_id = :sellerId
        )
        """, nativeQuery = true)
    void deleteOrderItemsBySellerId(@Param("sellerId") Long sellerId);
}
