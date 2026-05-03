package com.npl.controller;

import com.npl.dto.request.LabelRequest;
import com.npl.dto.response.LabelResponse;
import com.npl.service.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/labels")
@RequiredArgsConstructor
public class LabelController {

    private final LabelService labelService;

    @GetMapping
    public ResponseEntity<List<LabelResponse>> getLabelsByProject(@PathVariable String projectId) throws Exception {
        return ResponseEntity.ok(labelService.getLabelsByProject(projectId));
    }

    @PostMapping
    public ResponseEntity<LabelResponse> createLabel(
            @PathVariable String projectId,
            @RequestBody LabelRequest request,
            Authentication auth) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(labelService.createLabel(projectId, request, auth.getName()));
    }

    @PutMapping("/{labelId}")
    public ResponseEntity<LabelResponse> updateLabel(
            @PathVariable String projectId, // FIX: Consumed the path variable
            @PathVariable String labelId,
            @RequestBody LabelRequest request,
            Authentication auth) throws Exception {
        // FIX: Passed projectId down to the service
        return ResponseEntity.ok(labelService.updateLabel(projectId, labelId, request, auth.getName()));
    }

    @DeleteMapping("/{labelId}")
    public ResponseEntity<Void> deleteLabel(
            @PathVariable String projectId, // FIX: Added missing path variable
            @PathVariable String labelId,
            Authentication auth) throws Exception {
        // FIX: Passed projectId down to the service
        labelService.deleteLabel(projectId, labelId, auth.getName());
        return ResponseEntity.noContent().build();
    }
}