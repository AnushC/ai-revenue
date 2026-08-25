package org.example.app.services;

import org.example.app.entity.Customer;
import org.example.app.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(
            CustomerRepository customerRepository
    ) {
        this.customerRepository = customerRepository;
    }

    public Customer create(Customer customer) {

        if (customerRepository.existsByEmail(
                customer.getEmail())) {

            throw new IllegalArgumentException(
                    "Customer with this email already exists"
            );
        }

        return customerRepository.save(customer);
    }

    public List<Customer> getAll() {
        return customerRepository.findAll();
    }

    public Customer getById(Long id) {

        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found: " + id
                        )
                );
    }
}