package com.E_commers.Entity;


import jakarta.persistence.*;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Data
@Setter
@Entity
public class AddMore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String phone;
    @Transient
    private Long userId;
    private String houseNo;
    private String street;
private  String email;
    private String city;
    private String state;
    private String pincode;
    private  String landmark;
private  String area;
    // 🔗 Many addresses belong to ONE user
    @ManyToOne

    @JoinColumn(name = "user_id")
    private User user;




}
