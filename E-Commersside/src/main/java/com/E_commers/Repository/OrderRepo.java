package com.E_commers.Repository;

import com.E_commers.Entity.Order;
import com.E_commers.Entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepo extends JpaRepository<Order,Long>{
    List<Order> findByUser_Id(Long userId);


    @Modifying
    @Query("DELETE FROM Order o WHERE o.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    List<Order> findByOrderItemsSellerId(Long sellerId);
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM user_shopping_cart WHERE product_id = :productId", nativeQuery = true)
    void deleteByProductId(@Param("productId") Long productId);
}

