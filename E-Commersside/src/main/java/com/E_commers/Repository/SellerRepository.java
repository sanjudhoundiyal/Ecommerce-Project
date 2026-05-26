package com.E_commers.Repository;

import com.E_commers.Entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerRepository extends JpaRepository<
        Seller, Long> {


    Seller findByEmail(String email);

}