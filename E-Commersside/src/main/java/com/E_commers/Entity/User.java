package com.E_commers.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.Pattern;

import java.util.List;
@Entity
@Setter
@Getter

@Table(name = "user_profile_details")
public class User {

    @Column(name="user_id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // ✅ correct
    private String name;
//
    @Column(unique = true, nullable = false)
        private String email;
    private String password;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;
    private String addrss;
    private  String City;
    private String pincode;
    private String role;
    private String otp;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
   private List<Order> orders;

    @JsonManagedReference  // User side
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Address> addresses;


    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

}
