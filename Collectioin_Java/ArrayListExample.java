package Collectioin_Java;

import java.util.List;
import java.util.ArrayList;

public class ArrayListExample {
    public static void run() {
        System.out.println("=====ARRAYLIST EXAMPLE====");

        List<String> fruits = new ArrayList<>();

        System.out.println("Danh sach luc moi tao" + fruits);

        fruits.add("Apple");
        fruits.add("Orange");
        fruits.add("Banana");

        System.out.println("Danh sach sau khi add" + fruits);

        // lấy phần tử ở vị trí số 1
        String fruit1 = fruits.get(1);
        System.out.println("Phan tu o vi tri so 1" + fruit1);

        // đổi "Orange" (đang ở vị trí số 1) thành "Mango"
        fruits.set(1, "Mango");
        System.out.println("Danh sach sau khi set" + fruits);

        // xóa phần tử bằng giá trị cụ thể
        fruits.remove("Banana");
        System.out.println("Danh sach sau khi xoa" + fruits);

        // Xóa phần tử bằng chỉ số (vị trí) fruits.remove(0);

        // in ra số lượng phần tử hiện tại
        int soLuong = fruits.size();
        System.out.println("So luong phan tu hien tai" + soLuong);

    }
}
