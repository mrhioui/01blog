package com.example.demo.service;

import com.example.demo.dto.RegistrationDTO;
import com.example.demo.dto.UserDTO;
import com.example.demo.dto.UpdateProfileDTO;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO registerUser(RegistrationDTO registrationDTO) {
        if (userRepository.findByUsername(registrationDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(registrationDTO.getUsername())
                .email(registrationDTO.getEmail())
                .password(passwordEncoder.encode(registrationDTO.getPassword()))
                .role(Role.ROLE_USER)
                .profilePublic(true)
                .build();

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDTO(user);
    }

    public UserDTO getCurrentUser(String username) {
        return getUserByUsername(username);
    }

    public UserDTO updateCurrentUser(String currentUsername, UpdateProfileDTO updateProfileDTO) {
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        final String updatedUsername = updateProfileDTO.getUsername() != null
                ? updateProfileDTO.getUsername().trim()
                : user.getUsername();
        final String updatedEmail = updateProfileDTO.getEmail() != null
                ? updateProfileDTO.getEmail().trim()
                : user.getEmail();

        if (updatedUsername.isEmpty()) {
            throw new RuntimeException("Username is required");
        }

        if (updatedEmail.isEmpty()) {
            throw new RuntimeException("Email is required");
        }

        userRepository.findByUsername(updatedUsername)
                .filter(existing -> !Objects.equals(existing.getId(), user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Username already exists");
                });

        userRepository.findByEmail(updatedEmail)
                .filter(existing -> !Objects.equals(existing.getId(), user.getId()))
                .ifPresent(existing -> {
                    throw new RuntimeException("Email already exists");
                });

        user.setUsername(updatedUsername);
        user.setEmail(updatedEmail);

        if (updateProfileDTO.getProfilePublic() != null) {
            user.setProfilePublic(updateProfileDTO.getProfilePublic());
        }

        return convertToDTO(userRepository.save(user));
    }

    public UserDTO getProfileById(Long id, String requesterUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(user.getProfilePublic())) {
            return convertToDTO(user);
        }

        if (requesterUsername == null) {
            throw new AccessDeniedException("This profile is private");
        }

        User requester = userRepository.findByUsername(requesterUsername)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        if (Objects.equals(requester.getId(), user.getId()) || requester.getRole() == Role.ROLE_ADMIN) {
            return convertToDTO(user);
        }

        throw new AccessDeniedException("This profile is private");
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .profilePublic(Boolean.TRUE.equals(user.getProfilePublic()))
                .build();
    }
}
