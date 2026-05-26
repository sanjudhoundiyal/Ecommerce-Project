package com.E_commers.Service;

import com.E_commers.Controller.ForgotPasswordRequest;
import com.E_commers.Controller.VerifyOtpRequest;
import com.E_commers.Entity.Admin;
import com.E_commers.Repository.AdminRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class AdminService {

    @Autowired
    private AdminRepo adminRepo;


    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private EmailService emailService;

    // ✅ LOGIN
    public ResponseEntity<?> loginadmin(Admin admin) {

        Optional<Admin> data = adminRepo.findByEmail(admin.getEmail());

        if (data.isPresent()) {

            Admin dbAdmin = data.get();

            // ✅ BCrypt match
            if (encoder.matches(admin.getPassword(), dbAdmin.getPassword())) {

                dbAdmin.setPassword(null); // hide password
                return ResponseEntity.ok(dbAdmin);

            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid Password");
            }

        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("You are Not admin");
        }
    }

    // ✅ REGISTER
    public ResponseEntity<?> addlogin(Admin admin) {

        try {

            System.out.println(admin.getEmail());

            if(adminRepo.findByEmail(admin.getEmail()).isPresent()){
                return ResponseEntity.badRequest()
                        .body("Email Already Exists");
            }

            admin.setPassword(
                    encoder.encode(admin.getPassword())
            );

            adminRepo.save(admin);

            return ResponseEntity.ok("Admin Saved Successfully");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    public List<Admin> showall() {
   return  adminRepo.findAll();

    }


    public ResponseEntity<?> updateAdmin(Long id, Admin admin) {

        Optional<Admin> optionalAdmin = adminRepo.findById(id);

        if (optionalAdmin.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Admin Not Found");
        }

        Admin existingAdmin = optionalAdmin.get();

        // Duplicate Email Check
        Optional<Admin> emailCheck =
                adminRepo.findByEmail(admin.getEmail());

        if (emailCheck.isPresent() &&
                !emailCheck.get().getId().equals(id)) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email already exists");
        }

        existingAdmin.setName(admin.getName());
        existingAdmin.setEmail(admin.getEmail());
        existingAdmin.setPhone(admin.getPhone());
        existingAdmin.setRole(admin.getRole());

        // password update optional
        if (admin.getPassword() != null &&
                !admin.getPassword().isEmpty()) {

            existingAdmin.setPassword(
                    encoder.encode(admin.getPassword()));
        }

        adminRepo.save(existingAdmin);

        return ResponseEntity.ok("Admin Updated Successfully");
    }



    public ResponseEntity<?> forgotPassword(
            ForgotPasswordRequest request
    ) {

        Optional<Admin> optionalAdmin =
                adminRepo.findByEmail(request.getEmail());

        if (optionalAdmin.isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Admin Email not found");
        }

        Admin admin = optionalAdmin.get();

        // Generate OTP
        String otp = String.valueOf(
                100000 + new Random().nextInt(900000)
        );

        // Save OTP
        admin.setOtp(otp);

        adminRepo.save(admin);

        // Send OTP Email
        emailService.sendOtp(
                admin.getEmail(),
                otp
        );

        return ResponseEntity.ok(
                "OTP Sent Successfully"
        );
    }

    public ResponseEntity<?> verifyOtp(
            VerifyOtpRequest request
    ) {

        Optional<Admin> optionalAdmin =
                adminRepo.findByEmail(request.getEmail());

        if (optionalAdmin.isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("Admin not found");
        }

        Admin admin = optionalAdmin.get();

        // CHECK OTP
        if (admin.getOtp() == null ||
                !admin.getOtp().equals(request.getOtp())) {

            return ResponseEntity.badRequest()
                    .body("Invalid OTP");
        }

        // PASSWORD VALIDATION
        String password = request.getNewPassword();

        if (password.length() < 8) {

            return ResponseEntity.badRequest()
                    .body("Password must be at least 8 characters");
        }

        // UPDATE PASSWORD
        admin.setPassword(
                encoder.encode(password)
        );

        // CLEAR OTP
        admin.setOtp(null);

        adminRepo.save(admin);

        return ResponseEntity.ok(
                "Admin Password Updated Successfully"
        );
    }
}




