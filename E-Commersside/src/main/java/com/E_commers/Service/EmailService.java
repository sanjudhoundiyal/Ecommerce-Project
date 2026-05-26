package com.E_commers.Service;
import com.E_commers.Controller.VerifyOtpRequest;
import com.E_commers.Entity.User;
import com.E_commers.Repository.Userrepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private Userrepo userRepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // SEND OTP EMAIL
    public void sendOtp(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(toEmail);

        message.setSubject("Password Reset OTP");

        message.setText(
                "Your OTP for password reset is: "
                        + otp
                        + "\n\nValid for 5 minutes."
        );

        mailSender.send(message);
    }


    public ResponseEntity<?> verifyOtp(
            VerifyOtpRequest request
    ) {

        Optional<User> optionalUser =
                userRepo.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {

            return ResponseEntity.badRequest()
                    .body("User not found");
        }

        User user = optionalUser.get();

        // CHECK OTP
        if (user.getOtp() == null ||
                !user.getOtp().equals(request.getOtp())) {

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
        user.setPassword(
                passwordEncoder.encode(password)
        );

        // CLEAR OTP
        user.setOtp(null);

        userRepo.save(user);

        return ResponseEntity.ok(
                "Password Updated Successfully"
        );
    }
}