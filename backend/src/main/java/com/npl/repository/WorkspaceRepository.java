package com.npl.repository;

import com.npl.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace, String> {

    List<Workspace> findAllByOwnerId(String ownerId);

    Optional<Workspace> findBySlug(String slug);

    boolean existsBySlug(String slug);
}