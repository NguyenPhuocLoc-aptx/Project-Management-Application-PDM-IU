// backend/src/main/java/com/npl/repository/ProjectRepository.java
package com.npl.repository;

import com.npl.enums.ProjectStatus;
import com.npl.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    List<Project> findAllByWorkspaceId(String workspaceId);

    List<Project> findAllByOwnerId(String ownerId);

    List<Project> findAllByStatus(ProjectStatus status);

    /**
     * Single query: fetches all projects for a user together with
     * their owner and workspace — eliminates the N+1 on the dashboard.
     */
    @Query("""
        SELECT DISTINCT p FROM Project p
        JOIN FETCH p.owner
        JOIN FETCH p.workspace
        JOIN p.members m
        WHERE m.user.id = :userId
    """)
    List<Project> findAllByMemberUserIdWithDetails(@Param("userId") String userId);

    @Query("""
        SELECT p FROM Project p
        WHERE p.workspace.id = :workspaceId
        AND (p.name LIKE %:keyword% OR p.description LIKE %:keyword%)
    """)
    List<Project> searchInWorkspace(@Param("workspaceId") String workspaceId,
                                    @Param("keyword")     String keyword);
}