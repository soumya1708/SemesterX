package com.semesterx.semesterxbackend.service.impl;

import com.semesterx.semesterxbackend.entity.ContactMessage;
import com.semesterx.semesterxbackend.repository.ContactRepository;
import com.semesterx.semesterxbackend.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;

    @Override
    public ContactMessage saveMessage(
            ContactMessage contactMessage
    ) {

        return contactRepository.save(contactMessage);

    }

}