package com.thangbui.cv_management;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing // kích hoạt chế độ tự động ghi lại thời gian tạo và sửa.
public class CvManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(CvManagementApplication.class, args);
	}

}
