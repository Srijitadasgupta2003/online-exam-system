package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    //fetches the user for Spring Security
    Optional<User> findByEmail(String email);

    // check for duplicates
    boolean existsByEmail(String email);
}