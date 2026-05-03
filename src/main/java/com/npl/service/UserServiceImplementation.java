package com.npl.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.npl.security.JwtProvider;
import com.npl.exception.UserException;
import com.npl.model.PasswordResetToken;
import com.npl.model.User;
import com.npl.repository.PasswordResetTokenRepository;
import com.npl.repository.UserRepository;

@Service
public class UserServiceImplementation implements UserService {

	// FIXED: Use final fields for constructor injection
	private final UserRepository userRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JavaMailSender javaMailSender;
	private final JwtProvider jwtProvider; // FIXED: Injected to solve the static context error

	// FIXED: Replaced field injection with constructor injection
	@Autowired
	public UserServiceImplementation(UserRepository userRepository,
									 PasswordResetTokenRepository passwordResetTokenRepository,
									 PasswordEncoder passwordEncoder,
									 JavaMailSender javaMailSender,
									 JwtProvider jwtProvider) {
		this.userRepository = userRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.javaMailSender = javaMailSender;
		this.jwtProvider = jwtProvider;
	}

	@Override
	// FIXED: Removed ProjectException from method signature
	public User findUserProfileByJwt(String jwt) throws UserException {
		// FIXED: Called on the injected instance instead of statically
		String email = jwtProvider.getEmailFromJwtToken(jwt);
		return userRepository.findByEmail(email)
				.orElseThrow(() -> new UserException("User not found with email " + email));
	}

	@Override
	public User findUserByEmail(String username) throws UserException {
		return userRepository.findByEmail(username)
				.orElseThrow(() -> new UserException("User not found with email " + username));
	}

	@Override
	public User findUserById(String userId) throws UserException {
		return userRepository.findById(userId)
				.orElseThrow(() -> new UserException("User not found with id " + userId));
	}

	@Override
	public User updateUsersProjectSize(User user, int number) {
		// User model no longer has projectSize — this is a no-op kept for compatibility
		return userRepository.save(user);
	}

	@Override
	public void updatePassword(User user, String newPassword) {
		user.setPassword(passwordEncoder.encode(newPassword));
		userRepository.save(user);
	}

	@Override
	public void sendPasswordResetEmail(User user) {
		String resetToken = UUID.randomUUID().toString();
		LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

		PasswordResetToken passwordResetToken = PasswordResetToken.builder()
				.token(resetToken)
				.user(user)
				.expiresAt(expiresAt)
				.used(false)
				.build();
		passwordResetTokenRepository.save(passwordResetToken);

		sendEmail(user.getEmail(),
				"Click the following link to reset your password: http://localhost:5454/reset-password?token=" + resetToken);
	}

	// FIXED: Hardcoded the subject to resolve the IDE warning
	private void sendEmail(String to, String message) {
		SimpleMailMessage mailMessage = new SimpleMailMessage();
		mailMessage.setTo(to);
		mailMessage.setSubject("Password Reset");
		mailMessage.setText(message);
		javaMailSender.send(mailMessage);
	}
}