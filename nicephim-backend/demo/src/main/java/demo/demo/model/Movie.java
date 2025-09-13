package demo.demo.model;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.math.BigDecimal;

public class Movie {
    private UUID movieId;
    private String title;
    private String aliasTitle;
    private String description;
    private Short releaseYear;
    private String ageRating;
    private BigDecimal imdbRating;
    private boolean isSeries;
    private String posterUrl;
    private String bannerUrl;
    private UUID createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public UUID getMovieId() { return movieId; }
    public void setMovieId(UUID movieId) { this.movieId = movieId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAliasTitle() { return aliasTitle; }
    public void setAliasTitle(String aliasTitle) { this.aliasTitle = aliasTitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Short getReleaseYear() { return releaseYear; }
    public void setReleaseYear(Short releaseYear) { this.releaseYear = releaseYear; }

    public String getAgeRating() { return ageRating; }
    public void setAgeRating(String ageRating) { this.ageRating = ageRating; }

    public BigDecimal getImdbRating() { return imdbRating; }
    public void setImdbRating(BigDecimal imdbRating) { this.imdbRating = imdbRating; }

    public boolean isSeries() { return isSeries; }
    public void setSeries(boolean series) { isSeries = series; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}