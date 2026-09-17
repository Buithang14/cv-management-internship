package com.thangbui.cv_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider") // kích hoạt tự động ghi nhận thời gian + người tạo/sửa (Audit)
public class CvManagementApplication {



	public static void main(String[] args) {
		SpringApplication.run(CvManagementApplication.class, args);
	}

}
