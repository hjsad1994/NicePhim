package demo.demo.services.room;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class BroadcastScheduler {

    private static final Logger logger = Logger.getLogger(BroadcastScheduler.class.getName());

    @Autowired
    private WatchRoomService watchRoomService;

    /**
     * Scheduled task to check for rooms that need to start broadcasting
     * Runs every 5 seconds to ensure timely broadcasts
     */
    @Scheduled(fixedRate = 5000)
    public void checkScheduledBroadcasts() {
        try {
            List<Map<String, Object>> scheduledRooms = watchRoomService.getRoomsByStatus("scheduled");
            long currentTime = System.currentTimeMillis();

            for (Map<String, Object> room : scheduledRooms) {
                Long scheduledStartTime = (Long) room.get("scheduled_start_time");
                String roomId = (String) room.get("room_id");

                if (scheduledStartTime != null && scheduledStartTime <= currentTime) {
                    logger.info("🎬 Starting broadcast for room: " + roomId);
                    startBroadcast(roomId);
                }
            }
        } catch (Exception e) {
            logger.severe("Error checking scheduled broadcasts: " + e.getMessage());
        }
    }

    /**
     * Start a broadcast for a room
     */
    private void startBroadcast(String roomId) {
        try {
            // Update room status to live
            watchRoomService.updateBroadcastStatus(roomId, "live", System.currentTimeMillis());

            // Set playback state to playing
            watchRoomService.updateRoomState(roomId, 0L, 1, 1.0);

            logger.info("✅ Broadcast started for room: " + roomId);
        } catch (Exception e) {
            logger.severe("Error starting broadcast for room " + roomId + ": " + e.getMessage());
        }
    }

    /**
     * Sync all live rooms to ensure consistent playback
     * Runs every 30 seconds (reduced frequency)
     */
    @Scheduled(fixedRate = 30000)
    public void syncLiveRooms() {
        try {
            List<Map<String, Object>> liveRooms = watchRoomService.getRoomsByStatus("live");
            long currentTime = System.currentTimeMillis();

            for (Map<String, Object> room : liveRooms) {
                String roomId = (String) room.get("room_id");
                Long actualStartTime = (Long) room.get("actual_start_time");
                Object playbackStateObj = room.get("playback_state");
                Integer playbackState = null;
                if (playbackStateObj instanceof Short) {
                    playbackState = ((Short) playbackStateObj).intValue();
                } else if (playbackStateObj instanceof Integer) {
                    playbackState = (Integer) playbackStateObj;
                }

                if (actualStartTime != null && playbackState != null && playbackState == 1) {
                    // Calculate current position based on elapsed time
                    long elapsedTime = currentTime - actualStartTime;
                    long currentPosition = Math.max(0, elapsedTime);

                    // Update server managed time
                    watchRoomService.updateServerManagedTime(roomId, currentPosition);
                }
            }
        } catch (Exception e) {
            logger.severe("Error syncing live rooms: " + e.getMessage());
        }
    }
}