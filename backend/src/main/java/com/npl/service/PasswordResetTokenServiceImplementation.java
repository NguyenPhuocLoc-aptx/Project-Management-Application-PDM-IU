package com.npl.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.npl.model.PasswordResetToken;
import com.npl.repository.PasswordResetTokenRepository;

@Service
public class PasswordResetTokenServiceImplementation implements PasswordResetTokenService {

	@Autowired
	private PasswordResetTokenRepository passwordResetTokenRepository;

	@Override
	public PasswordResetToken findByToken(String token) {
		return passwordResetTokenRepository.findByToken(token).orElse(null);
	}

	@Override
	public void delete(PasswordResetToken resetToken) {
		passwordResetTokenRepository.delete(resetToken);
	}
}