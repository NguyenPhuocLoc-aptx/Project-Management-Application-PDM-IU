package com.npl.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class LabelRequest {

    @NotBlank(message = "Label name is required")
    private String name;

    @NotBlank(message = "Color is required")
    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Color must be a valid hex code e.g. #FF5733")
    private String color;

    private String description;
}