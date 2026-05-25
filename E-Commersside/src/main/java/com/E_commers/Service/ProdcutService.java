package com.E_commers.Service;

import com.E_commers.Entity.Product;
import com.E_commers.Entity.SubCategory;
import com.E_commers.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProdcutService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private SubCategoryRepository subCategoryRepo;



    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private OrderItem orderItem;

    @Autowired
    private WishlistRepo wishlistRepo;
    // ✅ Better folder (project root)
    private final String UPLOAD_DIR = "uploads/";

    // ✅ GET ALL
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    // ✅ SAVE PRODUCT WITH IMAGE
    public Product saveProductWithImage(Product product, MultipartFile file, Long subId) throws IOException {

        // 1. SubCategory
        SubCategory sc = subCategoryRepo.findById(subId)
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));
        product.setSubCategory(sc);

        // ✅ THIS LINE WAS MISSING
        product.setCategory(sc.getCategory());



        // 2. Image Upload
        if (file != null && !file.isEmpty()) {

            String originalName = file.getOriginalFilename();
            String fileName = UUID.randomUUID() + "_" + (originalName != null ? originalName : "image.jpg");

            Path uploadPath = Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);
            Files.write(filePath, file.getBytes());

            product.setImageUrl("/uploads/" + fileName);
        }

        return productRepo.save(product);
    }

    // ✅ SAFE DELETE
    public void deleteProduct(Long id) {

        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        try {
            productRepo.delete(product);
        } catch (Exception e) {
            throw new RuntimeException("Cannot delete product. It is linked to Cart/Orders");
        }
    }

    // ✅ GET BY ID
    public Product getProductById(Long id) {
        return productRepo.findById(id).orElse(null);
    }

    public Product findrecord(String slug) {
         return productRepo.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }




    public Product updateProduct(
            Long id,
            String name,
            String slug,
            Double price,
            Integer quantity,
            Double discount,
            String description,
            String deliveryDays,
            Long subcategoryId,
            MultipartFile image
    ) {

        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(name);
        product.setSlug(slug);
        product.setPrice(price);
        product.setQuantity(quantity);
        product.setDiscount(discount);
        product.setDescription(description);
        product.setDeliveryDays( deliveryDays);




        // ✅ Image upload
        if (image != null && !image.isEmpty()) {
            try {
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path path = Paths.get("uploads/", fileName);
                Files.write(path, image.getBytes());

                product.setImageUrl("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Image upload failed");
            }
        }

        return productRepo.save(product);
    }



    public List<Product> searchProducts(String keyword) {

        String[] words = keyword.toLowerCase().split("\\s+");
        List<Product> results = new ArrayList<>();

        for (String word : words) {
            results.addAll(productRepo.searchProducts(word));
        }

        // remove duplicates
        return results.stream().distinct().toList();
    }






    }
