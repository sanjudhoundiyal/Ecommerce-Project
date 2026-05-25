package com.E_commers.Controller;

import com.E_commers.Entity.SubCategory;
import com.E_commers.Repository.SubCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subcategories")
@CrossOrigin("*")
public class SubCategoryController {

    @Autowired
    private SubCategoryRepository repo;

    //  GET ALL
    @GetMapping
    public List<SubCategory> getAll() {
        return repo.findAll();
    }

    //
//     🔥 GET BY CATEGORY
    @GetMapping("/category/slug/{slug}")
    public List<SubCategory> getByCategorySlug(@PathVariable String slug) {
        return repo.findByCategorySlug(slug);
    }

    // 🔥 ADD
    @PostMapping
    public SubCategory add(@RequestBody SubCategory sub) {
        return repo.save(sub);
    }


    @PutMapping("/{id}")
    public SubCategory updateSubCategory(@PathVariable Long id,
                                         @RequestBody SubCategory subCategory) {
        SubCategory existing = repo.findById(id).orElseThrow();

        existing.setName(subCategory.getName());
        existing.setSlug(subCategory.getSlug());
        existing.setCategory(subCategory.getCategory());

        return repo.save(existing);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubCategory(@PathVariable Long id) { // 👈 Use '?' here
        if (repo.existsById(id)) {
            try {
                repo.deleteById(id);
                // Ab aap String bhej sakte hain bina kisi error ke
                return ResponseEntity.ok("Subcategory deleted successfully!");
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Cannot delete: Linked to products.");
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ID not found.");
    }


        }

