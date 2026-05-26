package com.E_commers.Service;

import com.E_commers.Entity.Address;
import com.E_commers.Entity.Admin;
import com.E_commers.Entity.User;
import com.E_commers.Repository.AddressREpo;
import com.E_commers.Repository.AdminRepo;
import com.E_commers.Repository.Userrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressREpo addressREpo;

    @Autowired
    private Userrepo userRepository;

    @Autowired
    private AdminRepo adminRepository;


    public Address createAddress(Long userId, Long adminId, Address address) {


        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            address.setUser(user);
        }


        if (adminId != null) {
            Admin admin = adminRepository.findById(adminId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

        }

        return addressREpo.save(address);
    }


    public List<Address> getAllAddresses() {
        return addressREpo.findAll();
    }


    public Address getAddressById(Long id) {
        return addressREpo.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
    }


    public Address updateAddress(Long id, Address newAddress) {
        Address address = addressREpo.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));


        address.setName(newAddress.getName());
        address.setEmail(newAddress.getEmail());
        address.setPhone(newAddress.getPhone());
        address.setHouseNo(newAddress.getHouseNo());
        address.setStreet(newAddress.getStreet());
        address.setArea(newAddress.getArea());
        address.setLandmark(newAddress.getLandmark());
        address.setCity(newAddress.getCity());
        address.setState(newAddress.getState());
        address.setCountry(newAddress.getCountry());
        address.setPincode(newAddress.getPincode());

        return addressREpo.save(address);
    }

    public void deleteAddress(Long id) {
        addressREpo.deleteById(id);
    }
}
