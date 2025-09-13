package demo.demo.dto.genre;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateGenreRequest {
    
    @NotBlank(message = "Tên thể loại không được để trống")
    @Size(max = 80, message = "Tên thể loại không được vượt quá 80 ký tự")
    private String name;

    // Default constructor
    public UpdateGenreRequest() {}

    // Constructor with parameters
    public UpdateGenreRequest(String name) {
        this.name = name;
    }

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "UpdateGenreRequest{" +
                "name='" + name + '\'' +
                '}';
    }
}
