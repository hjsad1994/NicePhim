package demo.demo.dto.genre;

import java.util.UUID;

public class GenreResponse {
    public UUID genreId;
    public String name;

    // Default constructor
    public GenreResponse() {}

    // Constructor with parameters
    public GenreResponse(UUID genreId, String name) {
        this.genreId = genreId;
        this.name = name;
    }

    @Override
    public String toString() {
        return "GenreResponse{" +
                "genreId=" + genreId +
                ", name='" + name + '\'' +
                '}';
    }
}
