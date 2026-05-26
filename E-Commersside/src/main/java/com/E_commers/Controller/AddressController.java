package com.E_commers.Controller;

import com.E_commers.Entity.Address;
import com.E_commers.Service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "*")
public class AddressController {

    @Autowired
    private AddressService addressService;

    // ➕ Create Address
    @PostMapping("/create")
    public Address createAddress(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long adminId,
            @RequestBody Address address
    ) {
        return addressService.createAddress(userId, adminId, address);
    }


    @GetMapping
    public List<Address> getAllAddresses() {
        return addressService.getAllAddresses();
    }


    @GetMapping("/{id}")
    public Address getAddress(@PathVariable Long id) {
        return addressService.getAddressById(id);
    }






    @PutMapping("/{id}")
    public Address updateAddress(@PathVariable Long id,
                                 @RequestBody Address address) {
        return addressService.updateAddress(id, address);
    }

    @DeleteMapping("/{id}")
    public String deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return "Address deleted successfully";
    }
}
