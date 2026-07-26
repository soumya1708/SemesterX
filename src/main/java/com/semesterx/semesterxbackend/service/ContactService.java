package com.semesterx.semesterxbackend.service;

import com.semesterx.semesterxbackend.entity.ContactMessage;

public interface ContactService {

    ContactMessage saveMessage(
            ContactMessage contactMessage
    );

}