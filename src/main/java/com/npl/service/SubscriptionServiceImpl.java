package com.npl.service;

import com.npl.enums.PlanType;
import com.npl.enums.SubscriptionStatus;
import com.npl.exception.UserException;
import com.npl.model.Subscription;
import com.npl.model.User;
import com.npl.repository.SubscriptionRepository;
import com.npl.repository.UserRepository;
import com.npl.dto.request.SubscriptionRequest;
import com.npl.dto.response.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @Override
    public Subscription createSubscription(String userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException("User not found."));

        Subscription subscription = new Subscription();
        subscription.setUser(user);
        subscription.setPlanType(PlanType.FREE);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(null);

        return subscriptionRepository.save(subscription);
    }

    @Override
    public SubscriptionResponse getSubscriptionByUser(String username) throws Exception {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("User not found."));

        Subscription subscription = subscriptionRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new Exception("Subscription not found for this user."));

        return mapToResponse(subscription);
    }

    @Override
    public SubscriptionResponse upgradePlan(SubscriptionRequest request, String username) throws Exception {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("User not found."));

        Subscription subscription = subscriptionRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new Exception("Subscription not found."));

        // FIXED: Map the string from your request to your actual Enum
        if (request.getPlanType() != null) {
            subscription.setPlanType(PlanType.valueOf(request.getPlanType().toUpperCase()));
        }

        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusMonths(1));
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        Subscription updatedSub = subscriptionRepository.save(subscription);
        return mapToResponse(updatedSub);
    }

    @Override
    public SubscriptionResponse cancelSubscription(String username) throws Exception {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserException("User not found."));

        Subscription subscription = subscriptionRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new Exception("Subscription not found."));

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setEndDate(LocalDateTime.now()); // Expire immediately

        Subscription cancelledSub = subscriptionRepository.save(subscription);
        return mapToResponse(cancelledSub);
    }

    // Helper method to convert the DB model into the Response DTO
    private SubscriptionResponse mapToResponse(Subscription subscription) {
        SubscriptionResponse response = new SubscriptionResponse();
        response.setId(subscription.getId());

        // FIXED: Convert Enums to Strings safely
        if (subscription.getPlanType() != null) {
            response.setPlanType(subscription.getPlanType().name());
        }
        if (subscription.getStatus() != null) {
            response.setStatus(subscription.getStatus().name());
        }

        response.setStartDate(subscription.getStartDate());
        response.setEndDate(subscription.getEndDate());
        return response;
    }
}