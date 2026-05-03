package com.npl.security;

import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtProvider {

	private final JwtConstant jwtConstant;

	public JwtProvider(JwtConstant jwtConstant) {
		this.jwtConstant = jwtConstant;
	}

	private SecretKey getSigningKey() {
		return Keys.hmacShaKeyFor(jwtConstant.getSecretKey().getBytes());
	}

	public String generateToken(Authentication auth) {
		Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
		String roles = populateAuthorities(authorities);

		return Jwts.builder()
				// FIXED: Updated to JJWT 0.12.x syntax
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + jwtConstant.getExpirationMs()))
				.claim("email", auth.getName())
				.claim("authorities", roles)
				.signWith(getSigningKey())
				.compact();
	}

	public String getEmailFromJwtToken(String jwt) {
		// Strip "Bearer " prefix if present
		if (jwt.startsWith("Bearer ")) {
			jwt = jwt.substring(7);
		}

		// FIXED: Updated to JJWT 0.12.x syntax
		Claims claims = Jwts.parser()
				.verifyWith(getSigningKey())
				.build()
				.parseSignedClaims(jwt)
				.getPayload();

		return String.valueOf(claims.get("email"));
	}

	private String populateAuthorities(Collection<? extends GrantedAuthority> collection) {
		Set<String> auths = new HashSet<>();
		for (GrantedAuthority authority : collection) {
			auths.add(authority.getAuthority());
		}
		return String.join(",", auths);
	}
}