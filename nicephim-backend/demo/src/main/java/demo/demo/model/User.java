package demo.demo.model;

import java.time.OffsetDateTime;
import java.util.UUID;

public class User {
	private UUID userId;
	private String username;
	private String email;
	private String displayName;
	private String avatarUrl;
	private boolean isAdmin;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

	public UUID getUserId() { return userId; }
	public void setUserId(UUID userId) { this.userId = userId; }
	public String getUsername() { return username; }
	public void setUsername(String username) { this.username = username; }
	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }
	public String getDisplayName() { return displayName; }
	public void setDisplayName(String displayName) { this.displayName = displayName; }
	public String getAvatarUrl() { return avatarUrl; }
	public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
	public boolean isAdmin() { return isAdmin; }
	public void setAdmin(boolean admin) { isAdmin = admin; }
	public OffsetDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
	public OffsetDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}


