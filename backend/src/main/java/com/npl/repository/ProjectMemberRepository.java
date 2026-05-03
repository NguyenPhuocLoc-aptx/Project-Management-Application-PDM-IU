package com.npl.repository;

import com.npl.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, String> {

    List<ProjectMember> findAllByUserId(String userId);

    List<ProjectMember> findAllByProjectId(String projectId);

    boolean existsByProjectIdAndUserId(String projectId, String userId);

    void deleteByProjectIdAndUserId(String projectId, String userId);
}