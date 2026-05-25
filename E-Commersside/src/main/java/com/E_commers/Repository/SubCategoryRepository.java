package com.E_commers.Repository;


import com.E_commers.Entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory ,Long> {
    List<SubCategory> findByCategorySlug(String slug);


}