package com.E_commers.Service;

import com.E_commers.Entity.Feedback;
import com.E_commers.Entity.Product;
import com.E_commers.Entity.User;
import com.E_commers.Repository.FeedbackRepo;
import com.E_commers.Repository.ProductRepo;
import com.E_commers.Repository.Userrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {


    @Autowired
    private FeedbackRepo feedbackRepo;

    @Autowired
    private Userrepo userRepo;

    @Autowired
    private ProductRepo productRepo;


    public Feedback addFeedback(Long userId, Long productId, int rating, String comment) {

        // 🔥 Fetch user & product
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 🔥 Create feedback
        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setProduct(product);
        feedback.setRating(rating);
        feedback.setComment(comment);

        return feedbackRepo.save(feedback);
    }


    public List<Feedback> getFeedbackByProduct(Long productId) {
        return feedbackRepo.findByProduct_Id(productId);
    }

}
