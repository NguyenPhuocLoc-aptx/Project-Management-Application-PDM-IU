package com.npl.service;

import com.npl.dto.request.LabelRequest;
import com.npl.dto.response.LabelResponse;
import java.util.List;

public interface LabelService {

    List<LabelResponse> getLabelsByProject(String projectId) throws Exception;

    LabelResponse createLabel(String projectId, LabelRequest request, String username) throws Exception;

    // FIX: Added projectId here
    LabelResponse updateLabel(String projectId, String labelId, LabelRequest request, String username) throws Exception;

    // FIX: Added projectId here
    void deleteLabel(String projectId, String labelId, String username) throws Exception;
}