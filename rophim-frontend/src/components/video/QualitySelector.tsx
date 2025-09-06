'use client';

interface VideoSource {
  quality: string;
  url: string;
}

interface QualitySelectorProps {
  qualities: VideoSource[];
  currentQuality: string;
  onQualityChange: (quality: string) => void;
}

export function QualitySelector({ qualities, currentQuality, onQualityChange }: QualitySelectorProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-300 mb-2">Chất lượng video</h4>
      <div className="space-y-1">
        {qualities.map((source) => (
          <button
            key={source.quality}
            onClick={() => onQualityChange(source.quality)}
            className={`block w-full text-left py-2 px-3 rounded transition-colors ${
              currentQuality === source.quality
                ? 'bg-red-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {source.quality}
            {source.quality === '1080p' && ' (HD)'}
            {source.quality === '720p' && ' (HD)'}
            {currentQuality === source.quality && (
              <span className="ml-2 text-xs">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
