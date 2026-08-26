package STREAM_LAMBDA;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class StreamLambdaExample {

    public static void run() {
        System.out.println("=== HỌC STREAM API VÀ LAMBDA ===");

        // Bài toán: Cho danh sách các số từ 1 đến 10.
        // Hãy lọc ra các số chẵn (chia hết cho 2) và in ra màn hình.
        List<Integer> numbers = Arrays.asList(1, 2, 4, 3, 5, 67, 10, 20, 6, 7, 8, 9, 10);

        System.out.println("Danh sách gốc: " + numbers);

        // -------------------------------------------------------------
        // BƯỚC 1: CÁCH TRUYỀN THỐNG (Trước Java 8 - Dùng vòng lặp for)
        // -------------------------------------------------------------
        System.out.println("\n--- 1. CÁCH TRUYỀN THỐNG (Dùng for) ---");

        // Tạo một list rỗng để hứng kết quả
        List<Integer> soChanTruyenThong = new ArrayList<>();

        // Viết vòng lặp duyệt qua từng số
        for (Integer so : numbers) {
            // Kiểm tra điều kiện, thỏa mãn thì add vào list mới
            if (so % 2 == 0) {
                soChanTruyenThong.add(so);
            }
        }
        System.out.println("Các số chẵn tìm được: " + soChanTruyenThong);

        // -------------------------------------------------------------
        // BƯỚC 2: CÁCH HIỆN ĐẠI (Từ Java 8 - Dùng Stream API và Lambda)
        // -------------------------------------------------------------
        System.out.println("\n--- 2. CÁCH HIỆN ĐẠI (Stream API + Lambda) ---");

        // Bạn chỉ cần ĐÚNG 1 DÒNG CODE!
        List<Integer> soChanStream = numbers.stream()
                .filter(n -> n % 2 == 0)
                .collect(Collectors.toList());

        System.out.println("Các số chẵn tìm được (bằng Stream): " + soChanStream);

        /*
         * GIẢI THÍCH CHI TIẾT DÒNG CODE TRÊN:
         * - .stream() : Biến cái List 'numbers' thành một cái "băng chuyền" dữ liệu.
         * 
         * - .filter(...) : Đây là "trạm lọc". Nó yêu cầu đưa cho nó 1 cái điều kiện.
         * 
         * - n -> n % 2 == 0 : ĐÂY CHÍNH LÀ LAMBDA EXPRESSION!
         * + 'n' đại diện cho từng phần tử đi qua băng chuyền.
         * + '->' nghĩa là "thực hiện logic sau".
         * + 'n % 2 == 0' là điều kiện (nếu đúng thì cho đi qua băng chuyền, sai thì vứt
         * bỏ).
         * 
         * - .collect(Collectors.toList()) : "Trạm đóng gói", nó đứng ở cuối băng chuyền
         * để nhặt tất cả các số đã lọt qua lưới lọc, rồi gói lại thành 1 List mới.
         */

        List<Integer> soNhanMuoi = numbers.stream().map(n -> n * 10).collect(Collectors.toList());
        System.out.println("So nhan muoi" + soNhanMuoi);
        List<Integer> sapXep = numbers.stream().sorted().collect(Collectors.toList());
        System.out.println("So sap xep" + sapXep);

        System.out.println(" filter, map & forEach together: ");
        numbers.stream()
                .filter(n -> n % 2 == 0) // Trạm 1: Chỉ cho số chẵn đi qua
                .map(n -> n * 10) // Trạm 2: Nhân số đó lên 10 lần
                .forEach(n -> System.out.println(n)); // Trạm 3: In ra màn hình (Không cần collect nữa)

    }
}
