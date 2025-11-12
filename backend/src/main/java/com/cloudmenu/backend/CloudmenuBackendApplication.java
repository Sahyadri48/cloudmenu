package com.cloudmenu.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.cloudmenu.backend", "com.cloudmenu.security"}) // Add if JwtUtil is here
public class CloudmenuBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CloudmenuBackendApplication.class, args);
    }
}
