package com.E_commers.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
@Data
@Getter
@Setter
@Entity
@Table(name = "user_AddressDetails")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private  String name;
    private String email;
     private long phone;
    private String houseNo;
    private String street;
    private String area;
    private String landmark;
    private String city;
    private String state;
    private String country;
    private String pincode;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @Column(name = "user_id", insertable = false, updatable = false)
    private Long userId;
}





