package com.E_commers.Security;

import com.E_commers.Controller.VerifyOtpRequest;
import com.E_commers.Entity.User;
import com.E_commers.Entity.Seller;
import com.E_commers.Repository.Userrepo;
import com.E_commers.Repository.SellerRepository;
import com.E_commers.Service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private Userrepo userRepo;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =========================
    // USER LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");
        String password = request.get("password");

        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String dbPassword = user.getPassword();

        if (dbPassword == null) {

            return ResponseEntity.badRequest()
                    .body("Password not set");
        }

        // ENCRYPTED PASSWORD MATCH
        if (passwordEncoder.matches(password, dbPassword)) {

            return ResponseEntity.ok(user);
        }

        // TEMPORARY PLAIN PASSWORD MATCH
        if (dbPassword.equals(password)) {

            // AUTO ENCRYPT OLD PASSWORD
            user.setPassword(
                    passwordEncoder.encode(password)
            );

            userRepo.save(user);

            return ResponseEntity.ok(user);
        }

        return ResponseEntity.status(401)
                .body("Invalid email or password");
    }

    // =========================
    // SELLER LOGIN
    // =========================
    @PostMapping("/seller-login")
    public ResponseEntity<?> sellerLogin(
            @RequestBody Map<String, String> request
    ) {

        String email = request.get("email");
        String password = request.get("password");

        Seller seller = sellerRepository.findByEmail(email);

        if (seller == null) {

            return ResponseEntity.status(404)
                    .body("Seller not found");
        }

        String dbPassword = seller.getPassword();

        if (dbPassword == null) {

            return ResponseEntity.badRequest()
                    .body("Password not set");
        }

        // ENCRYPTED PASSWORD MATCH
        if (passwordEncoder.matches(password, dbPassword)) {

            return ResponseEntity.ok(seller);
        }

        // TEMPORARY PLAIN PASSWORD MATCH
        if (dbPassword.equals(password)) {

            // AUTO ENCRYPT PASSWORD
            seller.setPassword(
                    passwordEncoder.encode(password)
            );

            sellerRepository.save(seller);

            return ResponseEntity.ok(seller);
        }

        return ResponseEntity.status(401)
                .body("Invalid email or password");
    }

    // =========================
    // VERIFY OTP
    // =========================
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request
    ) {

        return emailService.verifyOtp(request);
    }
}