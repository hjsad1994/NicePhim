package demo.demo.dto.movie;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import demo.demo.dto.genre.GenreResponse;

public class MovieResponse {
    public UUID movieId;
    public String title;
    public String aliasTitle;
    public String description;
    public Short releaseYear;
    public String ageRating;
    public BigDecimal imdbRating;
    public boolean isSeries;
    public String posterUrl;
    public String bannerUrl;
    public UUID createdBy;
    public OffsetDateTime createdAt;
    public OffsetDateTime updatedAt;
    public List<GenreResponse> genres;
    
    // Video fields
    public String videoId;
    public String hlsUrl;
    public String videoStatus;
}