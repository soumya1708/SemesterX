package com.semesterx.semesterxbackend.config;

import com.semesterx.semesterxbackend.security.JwtAuthenticationEntryPoint;
import com.semesterx.semesterxbackend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

                // Enable CORS
                .cors(Customizer.withDefaults())

                // Disable CSRF
                .csrf(csrf -> csrf.disable())

                // Stateless Session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Handle Unauthorized Requests
                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(authenticationEntryPoint)
                )

                // Authorization Rules
                .authorizeHttpRequests(auth -> auth

                        // Allow all preflight CORS requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public APIs
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/contact",
                                "/api/test",
                                "/api/subjects/**",
                                "/api/departments/**",
                                "/api/resources/**"
                        ).permitAll()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                // JWT Filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}