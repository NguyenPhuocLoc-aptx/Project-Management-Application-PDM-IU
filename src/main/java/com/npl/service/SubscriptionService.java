package com.npl.service;

import com.npl.model.Subscription;
import com.npl.dto.request.SubscriptionRequest;
import com.npl.dto.response.SubscriptionResponse;

public interface SubscriptionService {

    // Kept this returning the raw model since it's called internally during signup
    Subscription createSubscription(String userId) throws Exception;

    // FIX: Updated method names and return types to match the controller
    SubscriptionResponse getSubscriptionByUser(String username) throws Exception;

    SubscriptionResponse upgradePlan(SubscriptionRequest request, String username) throws Exception;

    SubscriptionResponse cancelSubscription(String username) throws Exception;
}