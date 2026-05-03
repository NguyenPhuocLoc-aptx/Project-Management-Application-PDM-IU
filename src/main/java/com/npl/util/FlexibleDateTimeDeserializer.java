package com.npl.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;


public class FlexibleDateTimeDeserializer extends StdDeserializer<LocalDateTime> {

    public FlexibleDateTimeDeserializer() {
        super(LocalDateTime.class);
    }

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
        String value = p.getText();

        if (value == null || value.isBlank()) {
            return null;
        }

        // Full datetime: "2026-04-28T10:30:00" or "2026-04-28T10:30:00.000"
        if (value.contains("T")) {
            return LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }

        // Date only: "2026-04-28"  → midnight of that day
        return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
    }
}