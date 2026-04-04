package com.practise.demo.GlobalHandling;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class Handler {
    @ExceptionHandler(CustomerNotFoundException.class)
    public ResponseEntity<ErrorResponse> geterrorresponse(CustomerNotFoundException ex){
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
            HttpStatus.NOT_FOUND.value(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(error,HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> geterror(Exception ex){
        ErrorResponse error = new ErrorResponse(
                ex.getMessage(),
                HttpStatus.NOT_FOUND.value(),
                System.currentTimeMillis()
        );
        return new ResponseEntity<>(error,HttpStatus.NOT_FOUND);
    }
}
