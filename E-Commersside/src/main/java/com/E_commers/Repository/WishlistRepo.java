package com.E_commers.Repository;


import com.E_commers.Entity.Wishlist;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
    public interface WishlistRepo   extends JpaRepository<Wishlist, Long> {

        List<Wishlist> findByUserId(Long userId);

        Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);



    Wishlist findFirstByUserIdAndProductId(
            Long userId,
            Long productId
    );




    @Modifying
    @Transactional
    @Query(value = "DELETE FROM wishlist WHERE product_id = :productId", nativeQuery = true)
    void deleteByProductId(@Param("productId") Long productId);
    }

