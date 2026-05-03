package com.npl.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Holds JWT configuration values injected from application.properties.
 * Do NOT hardcode secrets here — use application.properties or environment variables.
 */
@Component
public class JwtConstant {

	public static final String JWT_HEADER = "Authorization";

	@Value("${jwt.secret}")
	private String secretKey;

	@Value("${jwt.expiration-ms:86400000}") // Default: 24 hours
	private long expirationMs;

	public String getSecretKey() {
		return secretKey;
	}

	public long getExpirationMs() {
		return expirationMs;
	}
}