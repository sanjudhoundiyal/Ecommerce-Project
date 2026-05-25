package com.E_commers.Repository;

import com.E_commers.Entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepo  extends JpaRepository<Feedback ,Long> {


    List<Feedback> findByProduct_Id(Long productId);

}
