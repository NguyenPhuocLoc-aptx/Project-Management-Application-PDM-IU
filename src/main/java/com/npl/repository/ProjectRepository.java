package com.npl.repository;

import com.npl.enums.ProjectStatus;
import com.npl.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

// ── Project ────────────────────────────────────────────────────────
@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {
    List<Project> findAllByWorkspaceId(String workspaceId);
    List<Project> findAllByOwnerId(String ownerId);
    List<Project> findAllByStatus(ProjectStatus status);

    @Query("""
        SELECT p FROM Project p
        JOIN p.members m
        WHERE m.user.id = :userId
    """)
    List<Project> findAllByMemberUserId(@Param("userId") String userId);

    @Query("""
        SELECT p FROM Project p
        WHERE p.workspace.id = :workspaceId
        AND (p.name LIKE %:keyword% OR p.description LIKE %:keyword%)
    """)
    List<Project> searchInWorkspace(@Param("workspaceId") String workspaceId,
                                    @Param("keyword")     String keyword);
}
