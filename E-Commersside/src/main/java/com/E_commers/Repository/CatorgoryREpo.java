package com.E_commers.Repository;

import com.E_commers.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatorgoryREpo extends JpaRepository<Category,Long> {


    Category findBySlug(String slug);
}
