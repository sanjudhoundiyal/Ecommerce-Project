package com.E_commers.Controller;



import com.E_commers.Entity.Product;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    public static Specification<Product> hasCategory(String categorySlug) {
        return (root, query, cb) ->
                categorySlug == null || categorySlug.isEmpty()
                        ? null
                        : cb.equal(
                        root.get("subCategory")
                                .get("category")
                                .get("slug"),
                        categorySlug
                );
    }

    public static Specification<Product> hasSubCategory(String subSlug) {
        return (root, query, cb) ->
                subSlug == null || subSlug.isEmpty()
                        ? null
                        : cb.equal(
                        root.get("subCategory")
                                .get("slug"),
                        subSlug
                );
    }

    public static Specification<Product> minPrice(Double minPrice) {
        return (root, query, cb) ->
                minPrice == null
                        ? null
                        : cb.greaterThanOrEqualTo(
                        root.get("price"),
                        minPrice
                );
    }

    public static Specification<Product> maxPrice(Double maxPrice) {
        return (root, query, cb) ->
                maxPrice == null
                        ? null
                        : cb.lessThanOrEqualTo(
                        root.get("price"),
                        maxPrice
                );
    }
}