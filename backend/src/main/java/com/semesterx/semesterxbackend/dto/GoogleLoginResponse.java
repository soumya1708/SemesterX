package com.semesterx.semesterxbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleLoginResponse {

    private String token;

    private String email;

    private String name;

    private String pictureUrl;

    private String role;

    private boolean newUser;
}