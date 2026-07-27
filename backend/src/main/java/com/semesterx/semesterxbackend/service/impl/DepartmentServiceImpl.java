package com.semesterx.semesterxbackend.service.impl;

import com.semesterx.semesterxbackend.entity.Department;
import com.semesterx.semesterxbackend.repository.DepartmentRepository;
import com.semesterx.semesterxbackend.service.DepartmentService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository repository;

    @Override
    public List<Department> getAllDepartments() {
        return repository.findAll();
    }

}