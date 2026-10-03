package OPTIONAL_JAVA;

import java.util.Optional;

public class OptionalExample {
    public static void run() {
        System.out.println("=== HOC OPTIONAL VA XU LY NULL ===");

        // Bước 1: Trải nghiệm nỗi đau NullPointerException
        // (Bạn sẽ code vào đây)
        String tenKhachHang = null;
        // System.out.println("ten in hoa" + tenKhachHang.toUpperCase());
        // Bước 2: Dùng Optional làm "áo giáp"
        // (Bạn sẽ code vào đây)
        Optional<String> hopOptional = Optional.ofNullable(tenKhachHang);
        String ketQua = hopOptional.orElse("CLient Anonymous");
        System.out.println("ket qua: " + ketQua);

        // 3. Kết hợp Optional với Lambda (như Map) để làm hoa thị y
        // hệt dòng 12 lúc nãy nhưng KHÔNG BỊ LỖI
        String ketQuaInHoa = hopOptional.map(ten -> ten.toUpperCase()).orElse("Khong co ten nen khong in ra duoc");
        System.out.println("ten in hoa an toan: " + ketQuaInHoa);

    }
}
