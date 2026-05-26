package com.E_commers.Service;

import com.E_commers.Entity.User;
import com.E_commers.Repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private Userrepo userrepo;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private OrderRepo orderRepo;
    @Autowired
    private AddmoreAddressREpo addMoreRepo;   // ✅ FIX NAME

    @Autowired
    private AddressREpo addressRepo;



    @Autowired
    private CartRepo cartRepo;// ✅ FIX NAME

    // ✅ REGISTER USER (ALWAYS ENCRYPT)
    public User register(User user) {

        if(userrepo.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userrepo.save(user);
    }

    // ✅ LOGIN USER (HANDLE BOTH CASES)
    public User login(String email, String password) {



        User user = userrepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String dbPassword = user.getPassword();



        if (dbPassword == null || dbPassword.isEmpty()) {
            throw new RuntimeException("Password not set");
        }

        // ✅ 2. TRY ENCRYPTED MATCH FIRST
        try {
            if (passwordEncoder.matches(password, dbPassword)) {
                return user;
            }
        } catch (Exception e) {
            // ignore if not BCrypt
        }

        // ✅ 3. FALLBACK → PLAIN TEXT MATCH
        if (dbPassword.equals(password)) {

            // 🔥 AUTO-CONVERT TO ENCRYPTED
            user.setPassword(passwordEncoder.encode(password));
            userrepo.save(user);

            return user;
        }

        throw new RuntimeException("Invalid email or password");
    }

    // ✅ ADMIN ACCESS
    public List<User> getAllUsers() {
        return userrepo.findAll();
    }

    // ✅ UPDATE USER (SAFE PASSWORD UPDATE)
    public User updateUser(Long id, User updatedUser) {
        User existingUser = userrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        existingUser.setPhone(updatedUser.getPhone());

        // 🔥 IMPORTANT: ONLY UPDATE PASSWORD IF PROVIDED
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userrepo.save(existingUser);
    }

    // ✅ GET USER BY ID
    public User getUserById(Long id) {
        return userrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ✅ RESET PASSWORD (ENCRYPTED FIX)
    public void resetPassword(String email, String newPassword) {
        User user = userrepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔥 FIX: ENCODE PASSWORD
        user.setPassword(passwordEncoder.encode(newPassword));
        userrepo.save(user);
    }


    @Transactional
    public void deleteUser(Long id) {

        if (!userrepo.existsById(id)) {
            throw new RuntimeException("User not found");
        }

        // 🔥 DELETE ALL CHILD DATA FIRST
        addMoreRepo.deleteByUserId(id);   // ✅ add_more table (MAIN ERROR)
        addressRepo.deleteByUserId(id);   // ✅ address table
        orderRepo.deleteByUserId(id);     // ✅ orders

        cartRepo.deleteByUserId(id);
        // ✅ THEN DELETE USER
        userrepo.deleteById(id);

    }
    }
