'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { SUBTITLE_FONTS, SUBTITLE_COLORS } from '@/constants';

interface SubtitleSettingsProps {
  onClose: () => void;
}

export function SubtitleSettings({ onClose }: SubtitleSettingsProps) {
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontColor, setFontColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [opacity, setOpacity] = useState(0.8);
  const [position, setPosition] = useState('bottom');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Cài đặt phụ đề</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Preview */}
        <div className="mb-6 p-4 bg-black rounded-lg relative h-32 flex items-center justify-center">
          <div
            className={`text-center px-3 py-1 rounded ${position === 'top' ? 'absolute top-2' : position === 'middle' ? '' : 'absolute bottom-2'}`}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              color: fontColor,
              backgroundColor: `rgba(${parseInt(backgroundColor.slice(1,3), 16)}, ${parseInt(backgroundColor.slice(3,5), 16)}, ${parseInt(backgroundColor.slice(5,7), 16)}, ${opacity})`,
            }}
          >
            Văn bản phụ đề mẫu
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-4">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kích thước chữ: {fontSize}px
            </label>
            <input
              type="range"
              min="12"
              max="36"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Font chữ
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {SUBTITLE_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          {/* Font Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Màu chữ
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SUBTITLE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFontColor(color.value)}
                  className={`w-full h-10 rounded-lg border-2 ${
                    fontColor === color.value ? 'border-red-500' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Màu nền
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SUBTITLE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBackgroundColor(color.value)}
                  className={`w-full h-10 rounded-lg border-2 ${
                    backgroundColor === color.value ? 'border-red-500' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Độ trong suốt: {Math.round(opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vị trí hiển thị
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'top', label: 'Trên' },
                { value: 'middle', label: 'Giữa' },
                { value: 'bottom', label: 'Dưới' }
              ].map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setPosition(pos.value)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    position === pos.value
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => {
              // Reset to defaults
              setFontSize(18);
              setFontFamily('Arial');
              setFontColor('#FFFFFF');
              setBackgroundColor('#000000');
              setOpacity(0.8);
              setPosition('bottom');
            }}
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
}
