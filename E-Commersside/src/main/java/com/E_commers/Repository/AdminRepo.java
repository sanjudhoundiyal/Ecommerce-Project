package com.E_commers.Repository;

import com.E_commers.Entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepo extends JpaRepository<Admin,Long> {
    Optional<Admin> findByEmail(String email);

    boolean existsByEmail(String email);


}
