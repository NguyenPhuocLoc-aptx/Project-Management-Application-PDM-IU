package com.npl.security;

import java.io.IOException;
import java.util.List;

import javax.crypto.SecretKey;

// FIXED: Swapped deprecated Spring annotation for the JSpecify standard
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtTokenValidator extends OncePerRequestFilter {

	private final JwtConstant jwtConstant;

	public JwtTokenValidator(JwtConstant jwtConstant) {
		this.jwtConstant = jwtConstant;
	}

	@Override
	protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
		String path = request.getRequestURI();
		return path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs");
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request,
									@NonNull HttpServletResponse response,
									@NonNull FilterChain filterChain)
			throws ServletException, IOException {

		String header = request.getHeader(JwtConstant.JWT_HEADER);

		if (header != null && header.startsWith("Bearer ")) {
			String jwt = header.substring(7);

			// Guard against literal "null" string sent from frontend bugs
			if (!jwt.isBlank() && !jwt.equals("null")) {
				try {
					SecretKey key = Keys.hmacShaKeyFor(jwtConstant.getSecretKey().getBytes());

					// FIXED: Updated to JJWT 0.12.x syntax
					Claims claims = Jwts.parser()
							.verifyWith(key)
							.build()
							.parseSignedClaims(jwt)
							.getPayload();

					String email = String.valueOf(claims.get("email"));
					String authorities = String.valueOf(claims.get("authorities"));

					List<GrantedAuthority> auths =
							AuthorityUtils.commaSeparatedStringToAuthorityList(authorities);

					Authentication authentication =
							new UsernamePasswordAuthenticationToken(email, null, auths);
					SecurityContextHolder.getContext().setAuthentication(authentication);

				} catch (Exception e) {
					// Return 401 instead of throwing — better REST behavior
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
					return;
				}
			}
		}
		filterChain.doFilter(request, response);
	}
}