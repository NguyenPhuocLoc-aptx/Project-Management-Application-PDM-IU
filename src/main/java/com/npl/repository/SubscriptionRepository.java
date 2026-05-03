package com.npl.repository;

import com.npl.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    // Using the underscore pattern we learned earlier to search inside the User object!
    Optional<Subscription> findByUser_Id(String userId);

}