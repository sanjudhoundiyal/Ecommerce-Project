package com.E_commers.Controller;

import com.E_commers.Entity.Banner;
import com.E_commers.Entity.Product;
import com.E_commers.Repository.BannerRepository;
import com.E_commers.Repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/banner")
@CrossOrigin
public class HomeController {

    @Autowired
    private BannerRepository bannerRepository;

    @Autowired
    private ProductRepo productRepo;



    private final String UPLOAD_DIR = "uploads/";

    @PostMapping("/add")
    public Banner addBanner(

            @RequestParam("title") String title,
            @RequestParam("subtitle") String subtitle,
            @RequestParam("description") String description,
            @RequestParam("offerText") String offerText,
            @RequestParam("buttonLink") String buttonLink,
            @RequestParam("category") String category,
            @RequestParam("brand") String brand,
            @RequestParam("bannerType") String bannerType,

            // ONLY PRODUCT ID
            @RequestParam("productId") Long productId,


            @RequestParam("image") MultipartFile file

    ) throws IOException {

        // ================= PRODUCT FIND =================
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // ================= CREATE FOLDER =================
        Path uploadPath = Paths.get(UPLOAD_DIR);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // ================= SAVE IMAGE =================
        String cleanName = file.getOriginalFilename()
                .replaceAll("[^a-zA-Z0-9.]", "_");

        String fileName = System.currentTimeMillis() + "_" + cleanName;

        Files.write(uploadPath.resolve(fileName), file.getBytes());

        // ================= SAVE BANNER =================
        Banner banner = new Banner();

        banner.setTitle(title);
        banner.setSubtitle(subtitle);
        banner.setDescription(description);
        banner.setOfferText(offerText);

        banner.setButtonLink(buttonLink);
        banner.setCategory(category);
        banner.setBrand(brand);
        banner.setBannerType(bannerType);

        // PRODUCT DATA AUTO
        banner.setProductId(product.getId());
        banner.setProductName(product.getName());
        banner.setProductSlug(product.getSlug());
        banner.setProductPrice(product.getPrice());
        banner.setProductImage(product.getImageUrl());



        banner.setImageUrl(fileName);

        return bannerRepository.save(banner);
    }
    @GetMapping
    public List<Banner> getBanners() {
        return bannerRepository.findAll();
    }



    @DeleteMapping("/delete/{id}")
    public String deleteBanner(@PathVariable Long id) {

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        // 🔥 image file delete karo
        try {
            Path path = Paths.get("uploads/" + banner.getImageUrl());
            Files.deleteIfExists(path);
        } catch (Exception e) {
            System.out.println("Image delete failed");
        }

        bannerRepository.deleteById(id);

        return "Banner deleted successfully";
    }

    @PutMapping("/update/{id}")
    public Banner updateBanner(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("subtitle") String subtitle,
            @RequestParam(value = "image", required = false) MultipartFile file
    ) throws IOException {

        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        // 🔥 update text
        banner.setTitle(title);
        banner.setSubtitle(subtitle);

        // 🔥 agar new image aayi hai
        if (file != null && !file.isEmpty()) {

            // purani image delete
            try {
                Path oldPath = Paths.get("uploads/" + banner.getImageUrl());
                Files.deleteIfExists(oldPath);
            } catch (Exception e) {
                System.out.println("Old image delete failed");
            }

            // new image save
            String cleanName = file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.]", "_");
            String fileName = System.currentTimeMillis() + "_" + cleanName;

            Path uploadPath = Paths.get("uploads/");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Files.write(uploadPath.resolve(fileName), file.getBytes());

            banner.setImageUrl(fileName);
        }

        return bannerRepository.save(banner);
    }
}