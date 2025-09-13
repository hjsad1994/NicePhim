package demo.demo;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

	@Value("${media.hls.dir}")
	private String hlsDir;

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry
			.addResourceHandler("/videos/**")
			.addResourceLocations("file:" + ensureTrailingSlash(hlsDir))
			.setCacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic());
	}

	private String ensureTrailingSlash(String path) {
		if (path.endsWith("/") || path.endsWith("\\")) {
			return path;
		}
		return path + "/";
	}
}


