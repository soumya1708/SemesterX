package com.semesterx.backend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder() {

        try {
            RazorpayClient razorpayClient =
                    new RazorpayClient(
                            razorpayKeyId,
                            razorpayKeySecret
                    );

            JSONObject orderRequest = new JSONObject();

            // ₹99 = 9900 paise
            orderRequest.put("amount", 9900);
            orderRequest.put("currency", "INR");
            orderRequest.put(
                    "receipt",
                    "semesterx_" + System.currentTimeMillis()
            );

            Order order =
                    razorpayClient.orders.create(orderRequest);

            return ResponseEntity.ok(
                    Map.of(
                            "orderId", order.get("id"),
                            "amount", order.get("amount"),
                            "currency", order.get("currency"),
                            "keyId", razorpayKeyId
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message",
                                    "Unable to create Razorpay order"
                            )
                    );
        }
    }
}
