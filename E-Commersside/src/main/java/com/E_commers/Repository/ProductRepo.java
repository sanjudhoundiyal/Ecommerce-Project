package com.E_commers.Repository;

import com.E_commers.Entity.Category;
import com.E_commers.Entity.Product;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends
        JpaRepository<Product, Long>,
        JpaSpecificationExecutor<Product> {

    // SLUG
    @Query("SELECT p FROM Product p WHERE LOWER(p.slug) = LOWER(:slug)")
    Optional<Product> findBySlug(@Param("slug") String slug);

    // SUBCATEGORY PRODUCTS
    List<Product> findBySubCategory_Slug(String slug);

    // SEARCH
    @Query("SELECT DISTINCT p FROM Product p LEFT JOIN p.subCategory sc WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(sc.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchProducts(@Param("keyword") String keyword);

    // SELLER PRODUCTS
    List<Product> findBySellerId(Long sellerId);

    // DELETE SELLER PRODUCTS
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM master_product_details WHERE seller_id = :sellerId", nativeQuery = true)
    void deleteProductsBySellerId(@Param("sellerId") Long sellerId);

    List<Product> findByCategory(Category category);
}