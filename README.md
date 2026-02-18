# Online Exam System - Backend

A robust REST API backend for an Online Exam Portal built with **Java 25** and **Spring Boot 4.0.2**.

## Features
- **Layered Architecture**: Organized into Controller, Service, and Repository layers for high maintainability.
- **Database**: Cloud-hosted PostgreSQL via **Supabase**.
- **Security**: Stateless authentication using **JWT** (JSON Web Tokens).
- **ORM**: Spring Data JPA with Hibernate for automatic schema management.

## Tech Stack
- **Language**: Java 25
- **Framework**: Spring Boot 4.0.2
- **Database**: PostgreSQL (Supabase)
- **Security**: Spring Security + JJWT
- **Build Tool**: Maven

## Local Setup
1. Clone the repository.
2. Create a `.env` file in the root directory.
3. Add your Supabase credentials:
   ```properties
   DB_URL=your_url
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
