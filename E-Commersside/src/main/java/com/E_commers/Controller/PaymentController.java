package com.E_commers.Controller;
import com.E_commers.Entity.Payment;
import com.E_commers.Security.RazorpayConfig;
import com.E_commers.Service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RazorpayConfig razorpayConfig;

    // 🔥 CREATE ORDER
    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestBody Map<String, Object> data) throws Exception {

        if (data.get("amount") == null || data.get("dbOrderId") == null) {
            throw new RuntimeException("Missing data ❌");
        }

        double amount = Double.parseDouble(data.get("amount").toString());
        Long dbOrderId = Long.valueOf(data.get("dbOrderId").toString());

        RazorpayClient client = new RazorpayClient(
                razorpayConfig.getKeyId(),
                razorpayConfig.getKeySecret()
        );

        JSONObject options = new JSONObject();
        options.put("amount", (int) (amount * 100));
        options.put("currency", "INR");
        options.put("receipt", "order_" + dbOrderId);

        Order order = client.orders.create(options);

        Map<String, Object> res = new HashMap<>();
        res.put("razorpayOrderId", order.get("id"));
        res.put("amount", amount);
        res.put("dbOrderId", dbOrderId);

        return res;
    }

    // 🔥 SUCCESS
    @PostMapping("/success")
    public Payment paymentSuccess(@RequestBody Map<String, String> data) throws Exception {

        System.out.println("PAYMENT DATA = " + data); // 🔥 debug

        // ✅ NULL CHECK (VERY IMPORTANT)
        if (data.get("razorpay_order_id") == null ||
                data.get("razorpay_payment_id") == null ||
                data.get("razorpay_signature") == null ||
                data.get("dbOrderId") == null) {

            throw new RuntimeException("Missing payment data ❌");
        }

        String razorpayOrderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");
        Long dbOrderId = Long.valueOf(data.get("dbOrderId"));
        String method = data.getOrDefault("method", "ONLINE");

        // ✅ CORRECT FORMAT
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", razorpayOrderId);
        options.put("razorpay_payment_id", paymentId);
        options.put("razorpay_signature", signature);

        // ✅ VERIFY SIGNATURE
        boolean isValid = Utils.verifyPaymentSignature(
                options,
                razorpayConfig.getKeySecret()
        );

        if (!isValid) {
            throw new RuntimeException("Invalid signature ❌");
        }

        // ✅ SAVE PAYMENT
        return paymentService.savePayment(
                dbOrderId,
                method,
                "SUCCESS",
                paymentId
        );
    }

    // 🔥 FAILED
    @PostMapping("/failed")
    public Payment failed(@RequestBody Map<String, Object> data) {

        Long dbOrderId = Long.valueOf(data.get("dbOrderId").toString());

        return paymentService.savePayment(
                dbOrderId,
                "UPI",
                "FAILED",
                "FAILED"
        );
    }
}