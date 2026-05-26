package com.E_commers.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@Table(name ="user_PaymentDetails")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String method;
    private String status;
    private String transaction;
    private LocalDateTime paymentDate;
    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;


}
