package com.E_commers.Entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {

    private Long productId;
    private int quantity;
    private double price;
}
