package com.semesterx.semesterxbackend.controller;

import com.semesterx.semesterxbackend.entity.ContactMessage;
import com.semesterx.semesterxbackend.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessage sendMessage(
            @RequestBody ContactMessage contactMessage
    ) {

        return contactService.saveMessage(contactMessage);

    }

}