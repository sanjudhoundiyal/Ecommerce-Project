package com.E_commers.Controller;
import com.E_commers.Entity.AddMore;
import com.E_commers.Service.AddmoreAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addmoreaddress")
@CrossOrigin
public class AddMoreAdressController {

    @Autowired
    private AddmoreAddressService addressService;

    // ✅ ADD ADDRESS
    @PostMapping("/add/{userId}")
    public AddMore addAddress(
            @RequestBody AddMore address,
            @PathVariable Long userId) {

        return addressService.addAddress(address, userId);
    }

    // ✅ GET USER ADDRESSES
    @GetMapping("/user/{userId}")
    public List<AddMore> getUserAddresses(@PathVariable Long userId) {
        return addressService.getUserAddresses(userId);
    }
    @PutMapping("/{id}")
    public AddMore update(@PathVariable Long id, @RequestBody AddMore address) {
        return addressService.update(id, address);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        addressService.delete(id);
    }
}
