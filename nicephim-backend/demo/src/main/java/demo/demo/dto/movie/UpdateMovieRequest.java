package demo.demo.dto.movie;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import java.math.BigDecimal;

public class UpdateMovieRequest {
    @Size(max = 255, message = "Tên phim không được vượt quá 255 ký tự")
    public String title;

    @Size(max = 255, message = "Tên phụ không được vượt quá 255 ký tự")
    public String aliasTitle;

    public String description;

    @Min(value = 1900, message = "Năm phát hành phải từ 1900 trở lên")
    @Max(value = 2100, message = "Năm phát hành không được vượt quá 2100")
    public Short releaseYear;

    @Size(max = 10, message = "Phân loại độ tuổi không được vượt quá 10 ký tự")
    public String ageRating;

    @DecimalMin(value = "0.0", message = "Điểm IMDB phải từ 0.0 trở lên")
    @DecimalMax(value = "10.0", message = "Điểm IMDB không được vượt quá 10.0")
    public BigDecimal imdbRating;

    public Boolean isSeries;

    @Size(max = 500, message = "URL poster không được vượt quá 500 ký tự")
    public String posterUrl;

    @Size(max = 500, message = "URL banner không được vượt quá 500 ký tự")
    public String bannerUrl;
}