package demo.demo.services.room;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class BroadcastSchedulerService {

    private static final Logger logger = Logger.getLogger(BroadcastSchedulerService.class.getName());

    private final WatchRoomService watchRoomService;

    public BroadcastSchedulerService(WatchRoomService watchRoomService) {
        this.watchRoomService = watchRoomService;
    }

    /**
     * Check every 5 seconds for rooms that should start broadcasting
     */
    @Scheduled(fixedRate = 5000)
    @Transactional
    public void checkScheduledBroadcasts() {
        try {
            // Find all rooms with scheduled status that should start
            String sql = """
                SELECT room_id, scheduled_start_time, actual_start_time, broadcast_status
                FROM dbo.watch_rooms
                WHERE broadcast_status = 'scheduled'
                AND scheduled_start_time IS NOT NULL
                AND scheduled_start_time <= ?
                """;

            List<Map<String, Object>> roomsToStart = watchRoomService.getJdbcTemplate().queryForList(
                sql,
                System.currentTimeMillis()
            );

            for (Map<String, Object> room : roomsToStart) {
                String roomId = room.get("room_id").toString();
                Long scheduledStartTime = (Long) room.get("scheduled_start_time");

                logger.info("🎬 Starting broadcast for room: " + roomId);

                long startTime = System.currentTimeMillis();

                // Update room to live status
                String updateSql = """
                    UPDATE dbo.watch_rooms
                    SET broadcast_status = 'live',
                        actual_start_time = ?,
                        playback_state = 1,
                        current_time_ms = 0,
                        server_managed_time = 0,
                        updated_at = GETDATE()
                    WHERE room_id = ?
                    """;

                int rowsUpdated = watchRoomService.getJdbcTemplate().update(
                    updateSql,
                    startTime,
                    UUID.fromString(roomId)
                );

                if (rowsUpdated > 0) {
                    logger.info("✅ Broadcast started successfully for room: " + roomId);

                    // TODO: Send WebSocket notification to all clients in the room
                    // This will be implemented when we update the WebSocket handler
                } else {
                    logger.warning("⚠️ Failed to start broadcast for room: " + roomId);
                }
            }

        } catch (Exception e) {
            logger.severe("❌ Error in broadcast scheduler: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Update server-managed time for live broadcasts every second
     */
    @Scheduled(fixedRate = 1000)
    @Transactional
    public void updateLiveBroadcastTimes() {
        try {
            // Find all live broadcasts
            String sql = """
                SELECT room_id, actual_start_time, playback_state, current_time_ms, server_managed_time
                FROM dbo.watch_rooms
                WHERE broadcast_status = 'live'
                AND actual_start_time IS NOT NULL
                """;

            List<Map<String, Object>> liveRooms = watchRoomService.getJdbcTemplate().queryForList(sql);

            for (Map<String, Object> room : liveRooms) {
                String roomId = room.get("room_id").toString();
                Long actualStartTime = (Long) room.get("actual_start_time");
                Short playbackStateShort = (Short) room.get("playback_state");
                Integer playbackState = playbackStateShort != null ? playbackStateShort.intValue() : null;
                Long currentTimeMs = (Long) room.get("current_time_ms");
                Long serverManagedTime = (Long) room.get("server_managed_time");

                long currentTime = System.currentTimeMillis();
                long calculatedTime = 0;

                // Calculate time based on playback state
                if (playbackState != null && playbackState == 1) {
                    // Video is playing - calculate elapsed time since start
                    calculatedTime = currentTime - actualStartTime;

                    // Ensure we don't go negative (shouldn't happen, but safety check)
                    if (calculatedTime < 0) {
                        calculatedTime = 0;
                        logger.warning("⚠️ Negative time calculated for room " + roomId + ", resetting to 0");
                    }
                } else if (playbackState != null && playbackState == 2) {
                    // Video is paused - use the last known position
                    calculatedTime = currentTimeMs != null ? currentTimeMs : 0;
                } else {
                    // Video is stopped - use last known server managed time
                    calculatedTime = serverManagedTime != null ? serverManagedTime : 0;
                }

                // Update server managed time and current time
                String updateSql = """
                    UPDATE dbo.watch_rooms
                    SET server_managed_time = ?, current_time_ms = ?, updated_at = GETDATE()
                    WHERE room_id = ?
                    """;

                watchRoomService.getJdbcTemplate().update(updateSql, calculatedTime, calculatedTime, UUID.fromString(roomId));

                // Only log if time has changed significantly (to reduce log spam)
                if (serverManagedTime == null || Math.abs(calculatedTime - serverManagedTime) > 1000) {
                    logger.info("⏰ Updated time for room " + roomId + ": " + calculatedTime + "ms (state=" + playbackState + ")");
                }
            }

        } catch (Exception e) {
            logger.severe("❌ Error updating broadcast times: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Clean up ended broadcasts (rooms that have been live for more than 24 hours)
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupEndedBroadcasts() {
        try {
            long twentyFourHoursAgo = System.currentTimeMillis() - (24 * 60 * 60 * 1000);

            String sql = """
                UPDATE dbo.watch_rooms
                SET broadcast_status = 'ended', updated_at = GETDATE()
                WHERE broadcast_status = 'live'
                AND actual_start_time < ?
                """;

            int rowsUpdated = watchRoomService.getJdbcTemplate().update(sql, twentyFourHoursAgo);

            if (rowsUpdated > 0) {
                logger.info("🧹 Cleaned up " + rowsUpdated + " ended broadcasts");
            }

        } catch (Exception e) {
            logger.severe("❌ Error cleaning up broadcasts: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Get current server-managed time for a room
     */
    public Long getServerManagedTime(String roomId) {
        try {
            String sql = """
                SELECT server_managed_time, playback_state, actual_start_time, broadcast_status, current_time_ms, scheduled_start_time
                FROM dbo.watch_rooms
                WHERE room_id = ?
                """;

            Map<String, Object> result = watchRoomService.getJdbcTemplate().queryForMap(sql, UUID.fromString(roomId));

            if (result == null) {
                logger.warning("❌ Room not found: " + roomId);
                return 0L;
            }

            Long serverManagedTime = (Long) result.get("server_managed_time");
            Short playbackStateShort = (Short) result.get("playback_state");
            Integer playbackState = playbackStateShort != null ? playbackStateShort.intValue() : null;
            Long actualStartTime = (Long) result.get("actual_start_time");
            String broadcastStatus = (String) result.get("broadcast_status");
            Long currentTimeMs = (Long) result.get("current_time_ms");
            Long scheduledStartTime = (Long) result.get("scheduled_start_time");

            long currentTime = System.currentTimeMillis();
            long calculatedTime = 0;

            // Log room state for debugging
            logger.info("🔍 Room " + roomId + " state: status=" + broadcastStatus +
                       ", playback=" + playbackState + ", serverTime=" + serverManagedTime +
                       ", actualStart=" + actualStartTime + ", currentTimeMs=" + currentTimeMs);

            // Calculate time based on broadcast status and playback state
            if ("live".equals(broadcastStatus)) {
                if (playbackState != null && playbackState == 1 && actualStartTime != null) {
                    // Video is playing - calculate elapsed time since start
                    calculatedTime = currentTime - actualStartTime;

                    // Ensure we don't go negative
                    if (calculatedTime < 0) {
                        calculatedTime = 0;
                        logger.warning("⚠️ Negative calculated time for room " + roomId + ", resetting to 0");
                    }

                    logger.info("⏰ Live playing time for " + roomId + ": " + calculatedTime + "ms (elapsed since " + actualStartTime + ")");
                } else if (playbackState != null && playbackState == 2) {
                    // Video is paused - use the last known position
                    calculatedTime = currentTimeMs != null ? currentTimeMs : 0;
                    logger.info("⏰ Live paused time for " + roomId + ": " + calculatedTime + "ms");
                } else {
                    // Video is stopped or unknown state - use server managed time or calculate from start
                    if (actualStartTime != null && serverManagedTime != null && serverManagedTime > 0) {
                        // Use the last known server managed time
                        calculatedTime = serverManagedTime;
                        logger.info("⏰ Live stopped time for " + roomId + ": " + calculatedTime + "ms (using server managed time)");
                    } else if (actualStartTime != null) {
                        // Calculate from start time as fallback
                        calculatedTime = currentTime - actualStartTime;
                        if (calculatedTime < 0) calculatedTime = 0;
                        logger.info("⏰ Live stopped time for " + roomId + ": " + calculatedTime + "ms (calculated from start)");
                    } else {
                        // Last resort
                        calculatedTime = serverManagedTime != null ? serverManagedTime : 0;
                        logger.info("⏰ Live stopped time for " + roomId + ": " + calculatedTime + "ms (fallback)");
                    }
                }
            } else if ("scheduled".equals(broadcastStatus)) {
                // For scheduled broadcasts, return 0 (hasn't started yet)
                calculatedTime = 0L;
                logger.info("⏰ Scheduled broadcast time for " + roomId + ": 0ms (not started yet)");
            } else {
                // Not live or scheduled - use server managed time
                calculatedTime = serverManagedTime != null ? serverManagedTime : 0;
                logger.info("⏰ Non-live time for " + roomId + ": " + calculatedTime + "ms");
            }

            logger.info("✅ Final calculated time for " + roomId + ": " + calculatedTime + "ms");
            return calculatedTime;

        } catch (Exception e) {
            logger.severe("❌ Error getting server managed time for room " + roomId + ": " + e.getMessage());
            return 0L;
        }
    }
}