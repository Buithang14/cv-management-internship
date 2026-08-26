package Collectioin_Java.SET;

import java.util.Set;
//import java.util.HashSet;
//import java.util.TreeSet;
import java.util.LinkedHashSet;

public class SetExample {
    public static void run() {
        System.out.println("=====SET EXAMPLE====");

        // khởi tạo một HashSet chứa các chuỗi
        Set<String> students = new LinkedHashSet<>();

        // thêm các phần tử vào Set
        students.add("An");
        students.add("Binh");
        students.add("Thanh");
        students.add("Tuan");

        System.out.println("Danh sách sinh viên" + students);
        // thêm một người bị trùng lặp
        students.add("An");
        System.out.println("Danh sách sinh viên sau khi thêm một người bị trùng lặp" + students);

    }
}
