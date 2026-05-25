package com.E_commers.Controller;

import com.E_commers.Entity.Feedback;
import com.E_commers.Service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    // ADD FEEDBACK
    @PostMapping
    public Feedback addFeedback(@RequestBody Map<String, Object> data) {

        Long userId = Long.valueOf(data.get("userId").toString());
        Long productId = Long.valueOf(data.get("productId").toString());
        int rating = Integer.parseInt(data.get("rating").toString());
        String comment = data.get("comment").toString();

        return feedbackService.addFeedback(userId, productId, rating, comment);
    }

    // GET FEEDBACK
    @GetMapping("/product/{productId}")
    public List<Feedback> getFeedback(@PathVariable Long productId) {
        return feedbackService.getFeedbackByProduct(productId);
    }
}
