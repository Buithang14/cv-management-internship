package Collectioin_Java.GENERIC;

import java.util.ArrayList;
import java.util.List;

class Box<T> {
    private T item; // Biến item có kiểu dữ liệu là T (chưa biết trước là kiểu gì)

    // Hàm setter nhận vào tham số kiểu T
    public void set(T item) {
        this.item = item;
    }

    // Hàm getter trả về kiểu T
    public T get() {
        return this.item;
    }
}

public class GenericExample {

    // Chú ý: Phải đặt <E> ngay trước kiểu trả
    // về (void) để báo cho Java biết đây là một Generic Method
    public static <E> void inMang(E[] mang) {
        for (E phanTu : mang) {
            System.out.println(phanTu + " ");

        }
        System.out.println();
    }

    // // Ký hiệu <? extends Number> nghĩa là: Chấp nhận kiểu
    // Number HOẶC bất kỳ lớp con nào của Number (như Integer, Double...)
    public static void inDanhSachSo(List<? extends Number> danhSach) {
        for (Number so : danhSach) {
            System.out.print(so + " ");
        }
        System.out.println();
    }

    public static void run() {
        System.out.println("=== 1. TEST GENERIC METHOD ===");
        Integer[] numbers = { 1, 2, 3, 4, 5 };
        String[] strings = { "Hello", "World" };
        inMang(numbers);
        inMang(strings);

        System.out.println("=== 2. TEST WILDCARD ===");
        List<Integer> listInt = new ArrayList<>();
        listInt.add(10);
        listInt.add(20);

        List<Double> listDouble = new ArrayList<>();
        listDouble.add(5.5);
        listDouble.add(10.5);
        System.out.print("Danh sách Integer: ");
        inDanhSachSo(listInt); // Hoàn toàn hợp lệ vì Integer là con của Number
        System.out.print("Danh sách Double: ");
        inDanhSachSo(listDouble); // Hoàn toàn hợp lệ vì Double là con của Number

        System.out.println("=== 3. TRƯỚC KHI CÓ GENERIC ===");
        List listKhongGeneric = new ArrayList();

        listKhongGeneric.add("Hello");
        listKhongGeneric.add(123);
        listKhongGeneric.add(true);
        listKhongGeneric.add(new Object());

        System.out.println("List không Generic:" + listKhongGeneric);

        String duLieu = (String) listKhongGeneric.get(0);
        System.out.println("Lấy ra và ép kiểu thành công:" + duLieu);

        // String sai = (String) listKhongGeneric.get(1); // Lỗi Runtime
        Integer dung = (Integer) listKhongGeneric.get(1);
        System.out.println("Lấy ra và ép kiểu thành công:" + dung);

        System.out.println("=== 4. SAU KHI CÓ GENERIC ===");
        List<String> listCoGeneric = new ArrayList<>();
        listCoGeneric.add("Hello");
        // listCoGeneric.add(123); // Error Compile-time

        String duLieuGeneric = listCoGeneric.get(0);
        System.out.println("Lấy ra: " + duLieuGeneric);

        System.out.println("=== 5. TEST GENERIC CLASS (BOX) ===");
        Box<String> boxChuoi = new Box<>();
        boxChuoi.set("Hop nay dung chu");
        System.out.println("Box chua: " + boxChuoi.get());

        Box<Integer> boxSo = new Box<>();
        boxSo.set(999);
        System.out.println("Box chua so: " + boxSo.get());
    }
}
