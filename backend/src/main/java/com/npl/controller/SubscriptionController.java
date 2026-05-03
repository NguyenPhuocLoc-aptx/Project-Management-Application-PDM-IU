package com.npl.controller;

import com.npl.dto.request.SubscriptionRequest;
import com.npl.dto.response.SubscriptionResponse;
import com.npl.service.SubscriptionService; // FIX: Use the Interface here!
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    // FIX: Inject the interface, not the Impl class
    private final SubscriptionService subscriptionService;

    @GetMapping("/me")
    public ResponseEntity<SubscriptionResponse> getMySubscription(Authentication auth) throws Exception { // FIX: Added throws Exception
        return ResponseEntity.ok(subscriptionService.getSubscriptionByUser(auth.getName()));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<SubscriptionResponse> upgradePlan(
            @RequestBody SubscriptionRequest request,
            Authentication auth) throws Exception { // FIX: Added throws Exception
        return ResponseEntity.ok(subscriptionService.upgradePlan(request, auth.getName()));
    }

    @PostMapping("/cancel")
    public ResponseEntity<SubscriptionResponse> cancelSubscription(Authentication auth) throws Exception { // FIX: Added throws Exception
        return ResponseEntity.ok(subscriptionService.cancelSubscription(auth.getName()));
    }
}