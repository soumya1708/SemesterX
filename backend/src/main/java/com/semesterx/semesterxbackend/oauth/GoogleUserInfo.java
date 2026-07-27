package com.semesterx.semesterxbackend.oauth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleUserInfo {

    private String googleId;

    private String email;

    private String name;

    private String pictureUrl;

    private boolean emailVerified;

}