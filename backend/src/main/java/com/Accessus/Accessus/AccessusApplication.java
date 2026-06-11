package com.Accessus.Accessus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AccessusApplication {

	public static void main(String[] args) {
		SpringApplication.run(AccessusApplication.class, args);
	}

}
