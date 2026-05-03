package com.npl.repository;

import com.npl.model.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabelRepository extends JpaRepository<Label, String> {
    List<Label> findAllByProjectId(String projectId);
}