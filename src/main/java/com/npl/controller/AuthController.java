package com.npl.controller;

import com.npl.enums.UserRole;
import com.npl.security.JwtProvider;
import com.npl.exception.UserException;
import com.npl.model.PasswordResetToken;
import com.npl.model.User;
import com.npl.repository.UserRepository;
import com.npl.dto.request.LoginRequest;
import com.npl.dto.request.ResetPasswordRequest;
import com.npl.dto.response.ApiResponse;
import com.npl.dto.response.AuthResponse;
import com.npl.service.CustomUserDetailsService;
import com.npl.service.PasswordResetTokenService;
import com.npl.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class AuthController {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final CustomUserDetailsService customUserDetails;

	// Injected JwtProvider to fix the non-static method error
	private final JwtProvider jwtProvider;

	private final PasswordResetTokenService passwordResetTokenService;
	private final UserService userService;

	@PostMapping("/signup")
	public ResponseEntity<AuthResponse> createUserHandler(@RequestBody User user) throws UserException {

		String email = user.getEmail();
		String password = user.getPassword();
		String fullName = user.getFullName();

		boolean isEmailExist = userRepository.existsByEmail(email);

		if (isEmailExist) {
			throw new UserException("This email is already used with another account.");
		}

		User createdUser = new User();
		createdUser.setEmail(email);
		createdUser.setFullName(fullName);
		createdUser.setPassword(passwordEncoder.encode(password));
		createdUser.setRole(user.getRole() != null ? user.getRole() : UserRole.USER);

		userRepository.save(createdUser);

		Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);
		SecurityContextHolder.getContext().setAuthentication(authentication);

		// Calling the instance method instead of the static method
		String token = jwtProvider.generateToken(authentication);

		AuthResponse authResponse = new AuthResponse();
		authResponse.setJwt(token);
		authResponse.setMessage("Register Success");

		return new ResponseEntity<>(authResponse, HttpStatus.OK);
	}

	@PostMapping("/signin")
	public ResponseEntity<AuthResponse> signIn(@RequestBody LoginRequest loginRequest) {

		String username = loginRequest.getEmail();
		String password = loginRequest.getPassword();

		Authentication authentication = authenticate(username, password);
		SecurityContextHolder.getContext().setAuthentication(authentication);

		// Calling the instance method instead of the static method
		String token = jwtProvider.generateToken(authentication);

		AuthResponse authResponse = new AuthResponse();
		authResponse.setMessage("Login Success");
		authResponse.setJwt(token);

		User user = userRepository.findByEmail(username)
				.orElse(null);
		if (user != null) {
			authResponse.setFullName(user.getFullName());
		}

		return new ResponseEntity<>(authResponse, HttpStatus.OK);
	}

	private Authentication authenticate(String username, String password) {
		UserDetails userDetails = customUserDetails.loadUserByUsername(username);

		if (userDetails == null) {
			throw new BadCredentialsException("Invalid username or password.");
		}

		if (!passwordEncoder.matches(password, userDetails.getPassword())) {
			throw new BadCredentialsException("Invalid username or password.");
		}

		return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
	}


	@PostMapping("/reset-password/request")
	public ResponseEntity<ApiResponse> requestPasswordReset(@RequestParam("email") String email) throws UserException {
		User user = userService.findUserByEmail(email);
		System.out.println("AuthController.requestPasswordReset()");

		if (user == null) {
			// Fixed grammar warning
			throw new UserException("User not found.");
		}

		userService.sendPasswordResetEmail(user);

		ApiResponse res = new ApiResponse();
		res.setMessage("Password reset email sent successfully.");
		res.setStatus(true);

		return ResponseEntity.ok(res);
	}

	@PostMapping("/reset-password")
	public ResponseEntity<ApiResponse> resetPassword(@RequestBody ResetPasswordRequest req) throws UserException {

		PasswordResetToken resetToken = passwordResetTokenService.findByToken(req.getToken());

		if (resetToken == null ) {
			throw new UserException("A token is required.");
		}
		if(resetToken.isExpired()) {
			passwordResetTokenService.delete(resetToken);
			throw new UserException("The token has expired.");
		}

		User user = resetToken.getUser();
		userService.updatePassword(user, req.getPassword());

		// Delete the token
		passwordResetTokenService.delete(resetToken);

		ApiResponse res = new ApiResponse();
		res.setMessage("Password updated successfully.");
		res.setStatus(true);

		return ResponseEntity.ok(res);
	}
}