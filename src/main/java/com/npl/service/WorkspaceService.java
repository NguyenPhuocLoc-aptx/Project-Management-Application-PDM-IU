package com.npl.service;

import com.npl.exception.UserException;
import com.npl.model.Workspace;

import java.util.List;

public interface WorkspaceService {

    Workspace createWorkspace(String name, String slug, String description, String ownerEmail) throws UserException;

    List<Workspace> getWorkspacesByOwner(String ownerEmail) throws UserException;

    Workspace getWorkspaceById(String workspaceId) throws Exception;
}