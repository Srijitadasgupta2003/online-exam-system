package com.examhub.examserver.repository;

import com.examhub.examserver.domain.entity.User;
import com.examhub.examserver.domain.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    // ============ PAGINATION QUERIES ============

    // Paginated version for fetching users by role
    Page<User> findAllByRole(Role role, Pageable pageable);

    // ============ EXISTING QUERIES (UNCHANGED) ============

    //fetches the user for Spring Security
    Optional<User> findByEmail(String email);

    // check for duplicates
    boolean existsByEmail(String email);

    List<User> findAllByRole(Role role);
}
