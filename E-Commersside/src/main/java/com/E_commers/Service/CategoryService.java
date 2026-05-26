package com.E_commers.Service;

import com.E_commers.Entity.Category;
import com.E_commers.Repository.CatorgoryREpo; // Typo check: CatorgoryREpo
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CatorgoryREpo catorgoryREpo;

    // Create
    public Category createCategory(Category category) {
        return catorgoryREpo.save(category);
    }

    // Read All
    public List<Category> getAllCategories() {
        return catorgoryREpo.findAll();
    }

    // Read by ID
    public Category getCategoryById(Long id) {
        return catorgoryREpo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
    }

    // Update
    public Category updateCategory(Long id, Category newCategory) {
        Category existingCategory = catorgoryREpo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existingCategory.setName(newCategory.getName());
        existingCategory.setDescription(newCategory.getDescription());
        existingCategory.setSlug(newCategory.getSlug()); // Agar slug use kar rahe hain toh

        return catorgoryREpo.save(existingCategory);
    }

    // Delete
    public void deleteCategory(Long id) {
        if (!catorgoryREpo.existsById(id)) {
            throw new RuntimeException("Cannot delete: Category not found");
        }
        catorgoryREpo.deleteById(id);
    }
}