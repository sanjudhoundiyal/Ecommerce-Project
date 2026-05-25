package com.E_commers.Controller;

import com.E_commers.Entity.*;
import com.E_commers.Repository.CatorgoryREpo;
import com.E_commers.Service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private UserService userService;
    @Autowired
    private AdminService adminService;
    @Autowired
    private OrderService orderService;

    @Autowired
    private ProdcutService productService;

    @Autowired
    private PaymentService paymentService;
    @Autowired
    private CatorgoryREpo catorgoryREpo;


    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }


    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }


    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {

        try {

            productService.deleteProduct(id);

            return ResponseEntity.ok("Product deleted successfully");

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Cannot delete product: Product exists in cart/orders");
        }
    }


    @GetMapping("/alladmin")
    public List< Admin> showall()
    {
        return  adminService.showall();
    }


    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @PostMapping("/addcategory")
    public Category addCategory(@RequestBody Category category) {
        return catorgoryREpo.save(category);
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Admin admin) {
        return adminService.loginadmin(admin);
    }

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {

        System.out.println(admin.getEmail());
        return adminService.addlogin(admin);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateAdmin(
            @PathVariable Long id,
            @RequestBody Admin updatedAdmin
    ) {
return  adminService.updateAdmin(id, updatedAdmin);

    }


    @GetMapping("/all")
    public ResponseEntity<?> getAllAdmins() {

        return ResponseEntity.ok(
                adminService.showall()
        );
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) {

        return adminService
                .forgotPassword(request);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request
    ) {

        return adminService
                .verifyOtp(request);
    }

    }












