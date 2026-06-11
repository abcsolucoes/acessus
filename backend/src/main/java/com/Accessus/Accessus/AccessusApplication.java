package com.Accessus.Accessus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class AccessusApplication {

	public static void main(String[] args) {
		SpringApplication.run(AccessusApplication.class, args);
	}

}
