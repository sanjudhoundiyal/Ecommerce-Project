package com.E_commers.Controller;
import com.E_commers.Entity.Category;
import com.E_commers.Entity.Product;
import com.E_commers.Repository.CatorgoryREpo;
import com.E_commers.Repository.ProductRepo;
import com.E_commers.Service.ProdcutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*")
public class ProductController {

    @Autowired
    private ProdcutService productService;
    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CatorgoryREpo catorgoryREpo;

    // ✅ GET ALL PRODUCTS
    @GetMapping
    public ResponseEntity<List<Product>> list() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ✅ CREATE PRODUCT WITH IMAGE
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestParam String name,
            @RequestParam String slug,
            @RequestParam double price,
            @RequestParam int quantity,
            @RequestParam double discount,
            @RequestParam String description,
            @RequestParam  String DeliveryDate,
            @RequestParam Long subcategoryId,
            @RequestParam(value = "image", required = false) MultipartFile file
    ) throws IOException {

        Product p = new Product();
        p.setName(name);
        p.setSlug(slug);
        p.setPrice(price);
        p.setQuantity(quantity);
        p.setDiscount(discount);
        p.setDeliveryDays(DeliveryDate);
        p.setDescription(description);



        Product saved = productService.saveProductWithImage(p, file, subcategoryId);

        return ResponseEntity.ok(saved);
    }


    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getProduct(@PathVariable String slug) {

        // decode URL (important)
        slug = URLDecoder.decode(slug, StandardCharsets.UTF_8);

        Optional<Product> product = productRepo.findBySlug(slug);

        if (product.isEmpty()) {
            return ResponseEntity.status(404).body("Product not found");
        }

        return ResponseEntity.ok(product.get());
    }

    @GetMapping("/subcategory/{slug}")
    public List<Product> getBySubCategory(@PathVariable String slug) {
        return productRepo.findBySubCategory_Slug(slug);
    }





    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok("Deleted Successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body("Cannot delete: Product is used in Cart/Orders");
        }

    }
    @GetMapping("/category/{slug}")
    public ResponseEntity<List<Product>> getProductsByCategory(
            @PathVariable String slug) {

        Category category =
                catorgoryREpo.findBySlug(slug);

        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        List<Product> products =
                productRepo.findByCategory(category);

        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
                public List<Product> searchProducts(@RequestParam String keyword) {

                    return productService.searchProducts(keyword.trim());

                }
        @PutMapping(value = "/{id}", consumes = "multipart/form-data")
        public Product updateProduct(
                @PathVariable Long id,
                @RequestParam("name") String name,
                @RequestParam("slug") String slug,
                @RequestParam("price") Double price,
                @RequestParam("quantity") Integer quantity,
                @RequestParam("discount") Double discount,
                @RequestParam("description") String description,
                @RequestParam("deliveryDays") String deliveryDays,
                @RequestParam("subcategoryId") Long subcategoryId,
                @RequestParam(value = "image", required = false) MultipartFile image
        ) {
            return productService.updateProduct(
                    id, name, slug, price, quantity, discount,
                    description, deliveryDays, subcategoryId, image
            );
        }




    @GetMapping("/filter")
    public ResponseEntity<List<Product>> filterProducts(

            @RequestParam(required = false) String category,

            @RequestParam(required = false) String subcategory,

            @RequestParam(required = false) Double minPrice,

            @RequestParam(required = false) Double maxPrice

    ) {

        Specification<Product> spec = Specification
                .where(ProductSpecification.hasCategory(category))
                .and(ProductSpecification.hasSubCategory(subcategory))
                .and(ProductSpecification.minPrice(minPrice))
                .and(ProductSpecification.maxPrice(maxPrice));

        List<Product> products = productRepo.findAll(spec);

        return ResponseEntity.ok(products);
    }
    }


