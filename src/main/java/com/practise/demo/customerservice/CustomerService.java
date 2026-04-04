package com.practise.demo.customerservice;

import com.practise.demo.DTO.CustomerDTO;
import com.practise.demo.DTO.OrderDTO;
import com.practise.demo.GlobalHandling.CustomerNotFoundException;
import com.practise.demo.entity.Customer;
import com.practise.demo.entity.Order;
import com.practise.demo.repository.OrderRepository;
import com.practise.demo.repository.CustomerRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

	@Autowired
	private CustomerRepository customerRepo;

	@Autowired
	private OrderRepository orderRepo;

	// ================================
	// SEARCH + PAGINATION + SORT + CACHE
	// ================================

	public List<CustomerDTO> searchCustomers(
			String search,
			int page,
			int size,
			Sort sort
	) {

		System.out.println("Fetching from Mongo | Search = [" + search + "]");

		Pageable pageable = PageRequest.of(
				page,
				size,
				sort == null ? Sort.unsorted() : sort
		);

		Page<Customer> customersPage;

		if (search == null || search.trim().isEmpty()) {
			customersPage = customerRepo.findAll(pageable);
		} else {
			customersPage = customerRepo.findByNameContainingIgnoreCase(
					search.trim(),
					pageable
			);
		}

		return customersPage
				.getContent()
				.stream()
				.map(this::toDTO)
				.toList();
	}

	// ================================
	// GET BY ID (CACHE SINGLE CUSTOMER)
	// ================================

	public CustomerDTO getCustomer(String id) {

		System.out.println("Fetching Customer from Mongo: " + id);

		Customer c = customerRepo.findById(id)
				.orElseThrow(() ->
						new CustomerNotFoundException("Customer not found with : " + id)
				);

		return toDTO(c);
	}

	// ================================
	// ADD CUSTOMER (CLEAR CACHE)
	// ================================

	public Customer addCustomer(Customer c) {
		return customerRepo.save(c);
	}

	// ================================
	// DELETE CUSTOMER (CLEAR CACHE)
	// ================================

	public void deleteCustomer(String id) {
		customerRepo.deleteById(id);
	}

	// ================================
	// MAPPER (JOIN ORDERS SAFELY)
	// ================================
	private CustomerDTO toDTO(Customer c) {

		List<Order> orders =
				orderRepo.findByCustomerIdOrderByCreatedAtDesc(
						c.getId()
				);

		CustomerDTO dto = new CustomerDTO();
		dto.setId(c.getId());
		dto.setName(c.getName());

		dto.setOrders(
				orders.stream()
						.map(o ->
								new OrderDTO(
										o.getId(),
										o.getName()
								)
						)
						.toList()
		);

		return dto;
	}
	// ================================
// ADMIN HELPERS
// ================================
	public List<Customer> getAllCustomersRaw() {
		return customerRepo.findAll();
	}

	public long count() {
		return customerRepo.count();
	}

}
