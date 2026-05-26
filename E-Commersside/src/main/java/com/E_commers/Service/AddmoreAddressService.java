package com.E_commers.Service;

import com.E_commers.Entity.AddMore;
import com.E_commers.Entity.User;
import com.E_commers.Repository.AddmoreAddressREpo;
import com.E_commers.Repository.Userrepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddmoreAddressService {
    @Autowired
    private AddmoreAddressREpo addmoreAddressrepo;

    @Autowired
    private Userrepo userrepo;

    public AddMore addAddress(AddMore address, Long userId) {

        User user = userrepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        address.setUser(user);

        return addmoreAddressrepo.save(address);

    }
    public List<AddMore> getUserAddresses(Long userId) {
        return addmoreAddressrepo.findByUser_Id(userId);
    }

    public AddMore update(Long id, AddMore newData) {

        AddMore existing = addmoreAddressrepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // ✅ update fields
        existing.setFullName(newData.getFullName());
        existing.setEmail(newData.getEmail());
        existing.setPhone(newData.getPhone());
        existing.setHouseNo(newData.getHouseNo());
        existing.setStreet(newData.getStreet());


        existing.setCity(newData.getCity());
        existing.setState(newData.getState());
existing.setLandmark(newData.getLandmark());
        existing.setPincode(newData.getPincode());
existing.setArea(newData.getArea());
        // ✅ update user if provided
        if (newData.getUserId() != null) {
            User user = userrepo.findById(newData.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            existing.setUser(user);
        }

        return addmoreAddressrepo.save(existing);
    }
    public void delete(Long id) {
        addmoreAddressrepo.deleteById(id);
    }
}




