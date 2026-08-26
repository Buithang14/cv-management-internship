package Collectioin_Java.MAP;

import java.util.HashMap;
import java.util.Map;

public class MapExample {
    public static void run() {
        System.out.println("\n ===HOC MAP===");
        // khởi tạo một HASH MAP
        // Map nhận vào 2 kiểu dữ liệu <Key,Value>
        Map<String, String> danhBa = new HashMap<>();

        // thêm dữ liệu vào map
        danhBa.put("An", "0901234567");
        danhBa.put("Binh", "0987654321");
        danhBa.put("Cuong", "0911222333");

        // in ra map
        System.out.println("Danh sach danh ba" + danhBa);

        // lấy dữ liệu ra bằng .get(Key)
        String sdtBinh = danhBa.get("Binh");
        System.out.println("so dien thoai cua Binh la" + sdtBinh);
        // TODO: Điều gì xảy ra nếu ta dùng lại tên "An" nhưng với
        // một số điện thoại mới?
        danhBa.put("An", "099999999999999");
        System.out.println("Danh sach danh ba" + danhBa);
    }
}
