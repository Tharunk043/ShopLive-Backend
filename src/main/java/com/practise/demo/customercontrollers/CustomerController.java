package com.practise.demo.customercontrollers;

import java.util.List;

import com.practise.demo.DTO.CustomerDTO;
import com.practise.demo.entity.Order;
import com.practise.demo.customerservice.CustomerService;
import com.practise.demo.repository.OrderRepository;
import com.practise.demo.entity.Customer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/customer")
public class CustomerController {

	@Autowired
	private CustomerService service;

	@Autowired
	private OrderRepository orderRepo;

	// ================================
	// GET CUSTOMERS (ADMIN / DASHBOARD)
	// ================================
	@GetMapping
	public List<CustomerDTO> getCustomers(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "5") int size,
			@RequestParam(defaultValue = "name") String sortBy,
			@RequestParam(defaultValue = "ASC") String direction,
			@RequestParam(required = false) String search
	) {
		Sort sort = Sort.by(
				Sort.Direction.fromString(direction),
				sortBy
		);

		return service.searchCustomers(search, page, size, sort);
	}

	// ================================
	// ADD CUSTOMER
	// ================================
	@PostMapping
	public Customer addCustomer(@RequestBody Customer c) {
		return service.addCustomer(c);
	}

	// ================================
	// GET CUSTOMER BY ID
	// ================================
	@GetMapping("/{id}")
	public CustomerDTO getCustomer(@PathVariable String id) {
		return service.getCustomer(id);
	}

	// ================================
	// 🔐 GET MY ORDERS (JWT SAFE)
	// ================================
	@GetMapping("/my/orders")
	public ResponseEntity<List<Order>> getMyOrders(
			Authentication authentication
	) {
		// JWT subject = customerId
		String customerId = authentication.getName();

		List<Order> orders =
				orderRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);

		return ResponseEntity.ok(orders);
	}
}
