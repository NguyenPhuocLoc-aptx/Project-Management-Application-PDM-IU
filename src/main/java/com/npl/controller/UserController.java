package com.npl.controller;

import com.npl.exception.ProjectException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.npl.exception.UserException;
import com.npl.model.User;
import com.npl.service.UserService;

@RestController
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/api/users/profile")
	public ResponseEntity<User> getUserProfileHandler(
			@RequestHeader("Authorization") String jwt) throws UserException, ProjectException {
		User user = userService.findUserProfileByJwt(jwt);
		user.setPassword(null);
		return new ResponseEntity<>(user, HttpStatus.ACCEPTED);
	}

	@GetMapping("/api/users/{userId}")
	public ResponseEntity<User> findUserById(
			@PathVariable String userId,
			@RequestHeader("Authorization") String jwt) throws UserException {
		User user = userService.findUserById(userId);
		user.setPassword(null);
		return new ResponseEntity<>(user, HttpStatus.ACCEPTED);
	}
}