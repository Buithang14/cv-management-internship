package Collectioin_Java;

import java.util.List;
import java.util.LinkedList;

public class LinkedListExample {

    public static void run() {
        System.out.println("=====LINKEDLIST EXAMPLE====");

        // khởi tạo một LinkedList chứa các chuỗi
        List<String> tasks = new LinkedList<>();

        // add phần tử vào danh sách

        tasks.add("Hoc Java");
        tasks.add("do excersize");
        tasks.add("reading book");
        tasks.add("go to sleep");

        // in ra danh sách các công việc
        System.out.println("Danh sach task hien tais:" + tasks);
        // ép kiểu
        LinkedList<String> linkedList = (LinkedList<String>) tasks;

        // thêm vào vị trí đầu tiên
        linkedList.addFirst("Wake up");

        // thêm vào vị trí cuối cùng
        linkedList.addLast("Sleep");

        // in ra danh sách sau khi thêm vào đầu và cuối
        System.out.println("Danh sach task sau khi them vao dau va cuoi:" + linkedList);
        // lấy ra và xóa việc đầu tiên trong danh sách
        String firstTask = linkedList.pollFirst();
        System.out.println("Viec dau tien trong danh sach:" + firstTask);
        System.out.println("Danh sach sau khi lay ra va xoa viec dau tien:" + linkedList);
        // lấy ra và xóa việc cuối cùng trong danh sách
        String lastTask = linkedList.pollLast();
        System.out.println("Viec cuoi cung trong danh sach:" + lastTask);
        System.out.println("Danh sach sau khi lay ra va xoa viec cuoi cung:" + linkedList);
        // thêm vào vị trí số 1
        linkedList.add(1, "Coding");
        System.out.println("Danh sach sau khi them vao vi tri so 1:" + linkedList);
        // xóa việc ở vị trí số 1
        linkedList.remove(1);
        System.out.println("Danh sach sau khi xoa viec o vi tri so 1:" + linkedList);

    }
}
