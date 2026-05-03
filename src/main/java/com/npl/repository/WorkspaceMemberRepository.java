package com.npl.repository;

import com.npl.model.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, String> {

    List<WorkspaceMember> findAllByUserId(String userId);

    boolean existsByWorkspaceIdAndUserId(String workspaceId, String userId);
}