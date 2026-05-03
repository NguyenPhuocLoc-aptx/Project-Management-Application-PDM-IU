package com.npl.service;

import com.npl.dto.request.LabelRequest;
import com.npl.dto.response.LabelResponse;
import com.npl.model.Label;
import com.npl.model.Project;
import com.npl.model.User;
import com.npl.repository.LabelRepository;
import com.npl.repository.ProjectRepository;
import com.npl.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabelServiceImpl implements LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public List<LabelResponse> getLabelsByProject(String projectId) throws Exception {
        List<Label> labels = labelRepository.findAllByProjectId(projectId);
        return labels.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public LabelResponse createLabel(String projectId, LabelRequest request, String username) throws Exception {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new Exception("Project not found"));
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new Exception("User not found"));

        Label label = Label.builder()
                .project(project)
                .createdBy(user)
                .name(request.getName())
                .color(request.getColor())
                .description(request.getDescription())
                .build();

        Label savedLabel = labelRepository.save(label);
        return mapToResponse(savedLabel);
    }

    @Override
    public LabelResponse updateLabel(String projectId, String labelId, LabelRequest request, String username) throws Exception {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new Exception("Label not found"));

        if (request.getName() != null) label.setName(request.getName());
        if (request.getColor() != null) label.setColor(request.getColor());
        if (request.getDescription() != null) label.setDescription(request.getDescription());

        Label updatedLabel = labelRepository.save(label);
        return mapToResponse(updatedLabel);
    }

    @Override
    public void deleteLabel(String projectId, String labelId, String username) throws Exception {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new Exception("Label not found"));

        labelRepository.delete(label);
    }

    // Helper method to convert the DB model into the Response DTO
    private LabelResponse mapToResponse(Label label) {
        LabelResponse response = new LabelResponse();
        response.setId(label.getId());
        response.setName(label.getName());
        response.setColor(label.getColor());
        response.setDescription(label.getDescription());
        response.setProjectId(label.getProject().getId());
        return response;
    }
}