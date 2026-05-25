package com.E_commers.Controller;


import com.E_commers.Entity.AddMore;
import com.E_commers.Entity.User;
import com.E_commers.Repository.Userrepo;
import com.E_commers.Service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.Random;

@RestController
    @RequestMapping("/api/auth")
    @CrossOrigin("*")
    public class ForgotPasswordController {

        @Autowired
        private Userrepo userRepo;

        @Autowired
        private EmailService emailService;

        @PostMapping("/forgot-password")
        public ResponseEntity<?> forgotPassword(
                @RequestBody ForgotPasswordRequest request
        ) {

            Optional<User> optionalUser =
                    userRepo.findByEmail(request.getEmail());

            if (optionalUser.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Email not registered");
            }

            User user = optionalUser.get();

            // Generate 6 digit OTP
            String otp =
                    String.valueOf(
                            100000 + new Random().nextInt(900000)
                    );

            // Save OTP
            user.setOtp(otp);

            userRepo.save(user);

            // Send Email
            emailService.sendOtp(user.getEmail(), otp);

            return ResponseEntity.ok("OTP sent successfully");
        }

}
