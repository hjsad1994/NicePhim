package demo.demo.model;

import java.util.UUID;

public class Genre {
    private UUID genreId;
    private String name;

    // Default constructor
    public Genre() {}

    // Constructor with parameters
    public Genre(UUID genreId, String name) {
        this.genreId = genreId;
        this.name = name;
    }

    // Getters and setters
    public UUID getGenreId() {
        return genreId;
    }

    public void setGenreId(UUID genreId) {
        this.genreId = genreId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "Genre{" +
                "genreId=" + genreId +
                ", name='" + name + '\'' +
                '}';
    }
}
