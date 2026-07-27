package com.semesterx.semesterxbackend.controller;

import com.semesterx.semesterxbackend.dto.GoogleLoginRequest;
import com.semesterx.semesterxbackend.dto.GoogleLoginResponse;
import com.semesterx.semesterxbackend.oauth.GoogleAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final GoogleAuthService googleAuthService;

    public AuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<GoogleLoginResponse> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {

        GoogleLoginResponse response =
                googleAuthService.authenticate(request);

        return ResponseEntity.ok(response);
    }
}