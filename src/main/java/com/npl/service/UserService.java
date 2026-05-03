package com.npl.service;

import com.npl.exception.ProjectException;
import com.npl.exception.UserException;
import com.npl.model.User;

public interface UserService {

	User findUserProfileByJwt(String jwt) throws UserException, ProjectException;

	User findUserByEmail(String email) throws UserException;

	User findUserById(String userId) throws UserException;  // ✅ Long → String

	User updateUsersProjectSize(User user, int number);

	void updatePassword(User user, String newPassword);

	void sendPasswordResetEmail(User user);
}