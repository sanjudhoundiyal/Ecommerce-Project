package com.E_commers.Repository;

import com.E_commers.Entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardItemRepo extends JpaRepository<CartItem,Long> {
}
