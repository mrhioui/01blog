package com.example.demo.config;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${app.default-admin-password}")
    private String adminPassword;

    @org.springframework.beans.factory.annotation.Value("${app.default-user-password}")
    private String userPassword;

    @Override
    public void run(String... args) throws Exception {
        long count = userRepository.count();
        log.info("Current user count in database: {}", count);
        
        if (count == 0) {
            if (adminPassword == null || adminPassword.isBlank()
                    || userPassword == null || userPassword.isBlank()) {
                log.warn("Default user passwords are not configured (app.default-admin-password / "
                        + "app.default-user-password). Skipping default user creation.");
                return;
            }

            log.info("Creating default users...");
            User admin = User.builder()
                    .username("admin")
                    .email("admin@blog.com")
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ROLE_ADMIN)
                    .profilePublic(true)
                    .build();
            userRepository.save(admin);

            User user = User.builder()
                    .username("user")
                    .email("user@blog.com")
                    .password(passwordEncoder.encode(userPassword))
                    .role(Role.ROLE_USER)
                    .profilePublic(true)
                    .build();
            userRepository.save(user);

            log.info("Default users created.");
        } else {
            log.info("Users already exist in database, skipping initialization.");
        }
    }
}
