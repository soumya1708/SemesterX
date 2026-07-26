package com.semesterx.semesterxbackend.repository;

import com.semesterx.semesterxbackend.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository
        extends JpaRepository<ContactMessage, Long> {

}