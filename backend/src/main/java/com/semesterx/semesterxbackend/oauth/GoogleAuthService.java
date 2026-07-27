package com.semesterx.semesterxbackend.oauth;

import com.semesterx.semesterxbackend.dto.GoogleLoginRequest;
import com.semesterx.semesterxbackend.dto.GoogleLoginResponse;
import com.semesterx.semesterxbackend.entity.Role;
import com.semesterx.semesterxbackend.entity.User;
import com.semesterx.semesterxbackend.repository.UserRepository;
import com.semesterx.semesterxbackend.security.JwtService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class GoogleAuthService {
    private final UserRepository userRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtService jwtService;

    public GoogleAuthService(
            GoogleTokenVerifier googleTokenVerifier,
            UserRepository userRepository,
            JwtService jwtService) {

        this.googleTokenVerifier = googleTokenVerifier;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public GoogleLoginResponse authenticate(
            GoogleLoginRequest request) {

        try {

            GoogleUserInfo googleUser =
                    googleTokenVerifier.verify(request.getIdToken());

            boolean newUser = false;

            User user = userRepository
                    .findByEmail(googleUser.getEmail())
                    .orElse(null);

            if (user == null) {

                user = User.builder()
                        .googleId(googleUser.getGoogleId())
                        .email(googleUser.getEmail())
                        .name(googleUser.getName())
                        .pictureUrl(googleUser.getPictureUrl())
                        .emailVerified(googleUser.isEmailVerified())
                        .active(true)
                        .role(Role.STUDENT)
                        .createdAt(LocalDateTime.now())
                        .lastLogin(LocalDateTime.now())
                        .build();

                userRepository.save(user);

                newUser = true;

            } else {

                user.setLastLogin(LocalDateTime.now());
                user.setPictureUrl(googleUser.getPictureUrl());

                userRepository.save(user);
            }

            String jwt = jwtService.generateToken(user);

            return GoogleLoginResponse.builder()
                    .token(jwt)
                    .email(user.getEmail())
                    .name(user.getName())
                    .pictureUrl(user.getPictureUrl())
                    .role(user.getRole().name())
                    .newUser(newUser)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Google Authentication Failed");
        }
    }
}