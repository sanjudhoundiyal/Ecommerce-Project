    package com.E_commers.Controller;
    
    import com.E_commers.Entity.*;
    import com.E_commers.Repository.*;
    
    import com.E_commers.Repository.OrderItem;
    import com.E_commers.Service.EmailService;
    import jakarta.transaction.Transactional;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.MediaType;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;
    
    import java.io.IOException;
    
    import java.nio.file.Files;
    import java.nio.file.Path;
    import java.nio.file.Paths;
    import java.nio.file.StandardCopyOption;
    

    import java.util.List;
    
    @RestController
    @RequestMapping("api/seller")
    @CrossOrigin("*")
    public class SaleController {
    
        @Autowired
        private SellerRepository sellerRepository;
        @Autowired
        private  EmailService emailService;
        @Autowired
        private  BCryptPasswordEncoder passwordEncoder;
        @Autowired
        private ProductRepo productRepository;
    
        @Autowired
        private SubCategoryRepository subCategoryRepository;
    
    
        @Autowired
        private CartRepo cartRepo;
    
        @Autowired
        private OrderItem orderItem;
        @Autowired
        WishlistRepo wishlistRepo;
    
        @Autowired
        private OrderRepo orderrepo;
    
        @Autowired
        private ProductRepo productRepo;
    
        // =========================
        // SELLER REGISTER
        // =========================
        @PostMapping("/register")
        public Seller registerSeller(
                @RequestBody Seller seller
        ) {


            BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

            seller.setPassword(passwordEncoder.encode(seller.getPassword()));

            return sellerRepository.save(seller);

        }
    
        // =========================
        // GET ALL SELLERS
        // =========================
        @GetMapping("/all")
        public List<Seller> getAllSellers() {
    
            return sellerRepository.findAll();
        }
    
        // =========================
        // GET SINGLE SELLER
        // =========================
        @GetMapping("/{id}")
        public Seller getSingleSeller(
                @PathVariable Long id
        ) {
    
            return sellerRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException("Seller Not Found"));
        }
    
    
        @PostMapping(
                value = "/add-product/{sellerId}",
                consumes = MediaType.MULTIPART_FORM_DATA_VALUE
        )
        public Product addProduct(
    
                @PathVariable Long sellerId,
    
                @RequestParam("name") String name,
    
                @RequestParam("price") Double price,
    
                @RequestParam("description") String description,
    
                @RequestParam("quantity") int quantity,
    
                @RequestParam("deliveryDays") String deliveryDays,
    
                @RequestParam("discount") Double discount,
    
                @RequestParam("slug") String slug,
    
                @RequestParam("subcategoryId") Long subcategoryId,
    
                @RequestParam(value = "image", required = false)
                MultipartFile image
    
        ) throws IOException {
    
            Seller seller = sellerRepository.findById(sellerId)
                    .orElseThrow(() -> new RuntimeException("Seller Not Found"));
    
            SubCategory subCategory = subCategoryRepository.findById(subcategoryId)
                    .orElseThrow(() -> new RuntimeException("SubCategory Not Found"));
    
            Product product = new Product();
    
            product.setName(name);
            product.setPrice(price);
            product.setDescription(description);
            product.setQuantity(quantity);
            product.setDeliveryDays(deliveryDays);
            product.setDiscount(discount);
            product.setSlug(slug);
    
            // IMPORTANT
            product.setSeller(seller);
    
            product.setSubCategory(subCategory);
            product.setCategory(subCategory.getCategory());
    
            // IMAGE UPLOAD
            if (image != null && !image.isEmpty()) {

                String originalName = image.getOriginalFilename()
                        .replaceAll("\\s+", "_")
                        .replaceAll("[^a-zA-Z0-9._-]", "");
    
                String fileName =
                        System.currentTimeMillis()
                                + "_"
                                + originalName;
    
                String uploadDir = "uploads/";
    
                Path uploadPath = Paths.get(uploadDir);
    
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
    
                Files.copy(
                        image.getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );
    
                product.setImageUrl("/uploads/" + fileName);
            }
    
            return productRepository.save(product);
        }
    
        // =========================
        // UPDATE SELLER
        // =========================
        @PutMapping("/update/{id}")
        public Seller updateSeller(
    
                @PathVariable Long id,
    
                @RequestBody Seller updatedSeller
        ) {
    
            Seller seller = sellerRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException("Seller Not Found"));
    
            seller.setName(updatedSeller.getName());
            seller.setEmail(updatedSeller.getEmail());
            seller.setPassword(updatedSeller.getPassword());
            seller.setShopName(updatedSeller.getShopName());
            seller.setPhone(updatedSeller.getPhone());

            return sellerRepository.save(seller);
        }
    
        // =========================
        // DELETE SELLER
        // =========================
        @DeleteMapping("/delete/{id}")
        @Transactional
        public String deleteSeller(@PathVariable Long id) {
    
    
    
            cartRepo.deleteCartItemsBySellerId(id);
            orderItem.deleteOrderItemsBySellerId(id);
        productRepository.deleteProductsBySellerId(id);
    
    
    
    
            // then delete seller
            sellerRepository.deleteById(id);
    
            return "Seller Deleted Successfully";
        }
    
        // =========================
        // ADD PRODUCT
        // =========================
        // =========================
    // UPDATE PRODUCT
    // =========================
        @PutMapping(
                value = "/update-product/{productId}",
                consumes = MediaType.MULTIPART_FORM_DATA_VALUE
        )
        public Product updateProduct(
    
                @PathVariable Long productId,
    
                @RequestParam("name") String name,
    
                @RequestParam("price") Double price,
    
                @RequestParam("description") String description,
    
                @RequestParam("quantity") int quantity,
    
                @RequestParam("deliveryDays") String deliveryDays,
    
                @RequestParam("discount") Double discount,
    
                @RequestParam("slug") String slug,
    
                @RequestParam("subcategoryId") Long subcategoryId,
    
                @RequestParam(value = "image", required = false)
                MultipartFile image
    
        ) throws IOException {
    
            Product product = productRepository.findById(productId)
                    .orElseThrow(() ->
                            new RuntimeException("Product Not Found"));

            // UPDATE IMAGE
            if (image != null && !image.isEmpty()) {

                String originalName = image.getOriginalFilename()
                        .replaceAll("\\s+", "_")
                        .replaceAll("[^a-zA-Z0-9._-]", "");
    
                String fileName =
                        System.currentTimeMillis()
                                + "_"
                                + originalName;
    
                // UPLOAD FOLDER
                String uploadDir = "uploads/";
    
                Path uploadPath = Paths.get(uploadDir);
    
                // CREATE FOLDER
                if (!Files.exists(uploadPath)) {
    
                    Files.createDirectories(uploadPath);
                }
    
                // SAVE IMAGE
                Files.copy(
                        image.getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );
    
                product.setImageUrl("/uploads/" + fileName);
            }
    
            // FIND SUBCATEGORY
            SubCategory subCategory = subCategoryRepository.findById(subcategoryId)
                    .orElseThrow(() ->
                            new RuntimeException("SubCategory Not Found"));
    
            // UPDATE DATA
            product.setName(name);
    
            product.setPrice(price);
    
            product.setDescription(description);
    
            product.setQuantity(quantity);
    
            product.setDeliveryDays(deliveryDays);
    
            product.setDiscount(discount);
    
            product.setSlug(slug);
    
            product.setSubCategory(subCategory);
            product.setCategory(subCategory.getCategory());
    
            return productRepository.save(product);
        }
    
        // GET SELLER PRODUCTS
        // =========================
        @GetMapping("/products/{sellerId}")
        public List<Product> getSellerProducts(
                @PathVariable Long sellerId
        ) {
    
            return productRepository.findBySellerId(sellerId);
        }
    
        // =========================
        // GET SINGLE PRODUCT
        // =========================
        @GetMapping("/product/{productId}")
        public Product getSingleProduct(
                @PathVariable Long productId
        ) {
    
            return productRepository.findById(productId)
                    .orElseThrow(() ->
                            new RuntimeException("Product Not Found"));
        }
    
        // =========================
        // DELETE PRODUCT
        // =========================
        @DeleteMapping("/delete-product/{productId}")
        public String deleteProduct(
                @PathVariable Long productId
        ) {
    
            wishlistRepo.deleteByProductId(productId);
    
            cartRepo.deleteByProductId(productId);
    
            orderItem.deleteByProductId(productId);
    
            productRepository.deleteById(productId);
    
    
            return "Product Deleted Successfully";
        }
    
        // =========================
        // UPDATE PRODUCT
        // =========================
        @PutMapping("/update-product/{productId}")
        public Product updateProduct(
    
                @PathVariable Long productId,
    
                @RequestBody Product updatedProduct
        ) {
    
            Product product = productRepository.findById(productId)
                    .orElseThrow(() ->
                            new RuntimeException("Product Not Found"));
    
            product.setName(updatedProduct.getName());
    
            product.setPrice(updatedProduct.getPrice());
    
            product.setDescription(updatedProduct.getDescription());
    
            product.setQuantity(updatedProduct.getQuantity());
    
            product.setDiscount(updatedProduct.getDiscount());
    
            product.setDeliveryDays(updatedProduct.getDeliveryDays());
    
            return productRepository.save(product);
        }
    
    
        @GetMapping("/orders/{sellerId}")
        public List<Order> getSellerOrders(
                @PathVariable Long sellerId
        ) {
    
            return orderrepo.findByOrderItemsSellerId(sellerId);
        }
    
        @PutMapping("/update-status/{orderId}")
        public Order updateOrderStatus(
                @PathVariable Long orderId,
                @RequestParam String status
        ) {
    
            Order order = orderrepo.findById(orderId)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
    
            order.setStatus(status);
    
            return orderrepo.save(order);
        }
    
    
    
            // SEND OTP
            @PostMapping("/forgot-password")
            public ResponseEntity<?> forgotPassword(
                    @RequestBody ForgotPasswordRequest request
            ) {
        
                Seller seller =
                        sellerRepository.findByEmail(
                                request.getEmail()
                        );
        
                if (seller == null) {
        
                    return ResponseEntity.badRequest()
                            .body("Email not found");
                }
        
                // GENERATE OTP
                String otp = String.valueOf(
                        (int) ((Math.random() * 900000) + 100000)
                );
        
                // SAVE OTP
                seller.setOtp(otp);
        
                sellerRepository.save(seller);
        
                // SEND EMAIL
                emailService.sendOtp(
                        seller.getEmail(),
                        otp
                );
        
                return ResponseEntity.ok(
                        "OTP Sent Successfully"
                );
            }
        
            // VERIFY OTP + RESET PASSWORD
            @PostMapping("/verify-otp")
        public ResponseEntity<?> verifyOtp(
                @RequestBody VerifyOtpRequest request
        ) {
    
            Seller seller =
                    sellerRepository.findByEmail(
                            request.getEmail()
                    );
    
            if (seller == null) {
    
                return ResponseEntity.badRequest()
                        .body("Seller not found");
            }
    
            // CHECK OTP
            if (seller.getOtp() == null ||
                    !seller.getOtp().equals(
                            request.getOtp()
                    )) {
    
                return ResponseEntity.badRequest()
                        .body("Invalid OTP");
            }
    
            // UPDATE PASSWORD
            seller.setPassword(
                    passwordEncoder.encode(
                            request.getNewPassword()
                    )
            );
    
            // CLEAR OTP
            seller.setOtp(null);
    
            sellerRepository.save(seller);
    
            return ResponseEntity.ok(
                    "Password Reset Successfully"
            );
        }
    }
    
    
