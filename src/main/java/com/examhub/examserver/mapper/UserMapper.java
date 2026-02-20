package com.examhub.examserver.mapper;

import com.examhub.examserver.domain.dto.auth.AuthResponse;
import com.examhub.examserver.domain.dto.auth.RegisterRequest;
import com.examhub.examserver.domain.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    //Converts the incoming JSON payload into a Database Entity
    public User toEntity(RegisterRequest request) {
        User user = new User();

        //we access fields using request.fieldName() we get in record, instead of the traditional request.getFieldName()
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setRole(request.role());

        return user;
    }

    //Converts the Database Entity and the generated JWT into the outgoing DTO
    public AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}