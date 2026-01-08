'use client';

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import useSettingsModal from '@/app/hooks/useSettingsModal';
import { useTheme, DEFAULT_ACCENT_COLOR } from '@/app/context/ThemeContext';

const PRESET_COLORS = [
  '#60A5FA', // Blue (default)
  '#34D399', // Green
  '#F472B6', // Pink
  '#FBBF24', // Yellow
  '#A78BFA', // Purple
  '#FB7185', // Red
  '#2DD4BF', // Teal
  '#FB923C', // Orange
];

const SettingsModal: React.FC = () => {
  const settingsModal = useSettingsModal();
  const { accentColor, isDarkMode, setAccentColor, setIsDarkMode, resetTheme } = useTheme();

  // Local state for pending changes
  const [pendingColor, setPendingColor] = useState(accentColor);
  const [pendingDarkMode, setPendingDarkMode] = useState(isDarkMode);
  const [customColor, setCustomColor] = useState(accentColor);

  // Sync local state when modal opens
  useEffect(() => {
    if (settingsModal.isOpen) {
      setPendingColor(accentColor);
      setPendingDarkMode(isDarkMode);
      setCustomColor(accentColor);
    }
  }, [settingsModal.isOpen, accentColor, isDarkMode]);

  const handleSave = () => {
    setAccentColor(pendingColor);
    setIsDarkMode(pendingDarkMode);
    settingsModal.onClose();
  };

  const handleReset = () => {
    resetTheme();
    setPendingColor(DEFAULT_ACCENT_COLOR);
    setPendingDarkMode(false);
    setCustomColor(DEFAULT_ACCENT_COLOR);
  };

  const handleColorSelect = (color: string) => {
    setPendingColor(color);
    setCustomColor(color);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    setPendingColor(color);
  };

  const bodyContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Settings
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Customize your app appearance
        </p>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Dark Mode
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Switch between light and dark themes
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPendingDarkMode(!pendingDarkMode)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
            ${pendingDarkMode ? 'bg-[var(--accent-color)]' : 'bg-gray-300'}
          `}
          style={{ backgroundColor: pendingDarkMode ? pendingColor : undefined }}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200
              ${pendingDarkMode ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* Accent Color */}
      <div className="py-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Accent Color
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Choose your preferred accent color for buttons, badges, and highlights
        </p>

        {/* Preset Colors */}
        <div className="flex flex-wrap gap-3 mb-4">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={`
                w-10 h-10 rounded-xl transition-all duration-200
                ${pendingColor === color
                  ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110'
                  : 'hover:scale-105'
                }
              `}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>

        {/* Custom Color Picker */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500 dark:text-gray-400">
            Custom:
          </label>
          <div className="relative">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden"
              style={{ backgroundColor: customColor }}
            />
          </div>
          <input
            type="text"
            value={customColor.toUpperCase()}
            onChange={(e) => {
              const value = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                setCustomColor(value);
                if (value.length === 7) {
                  setPendingColor(value);
                }
              }
            }}
            className="w-24 px-3 py-2 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            placeholder="#60A5FA"
          />
        </div>

        {/* Preview */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Preview</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-white rounded-xl shadow-lg transition-all duration-200"
              style={{
                backgroundColor: pendingColor,
                boxShadow: `0 4px 14px ${pendingColor}40`
              }}
            >
              Primary Button
            </button>
            <span
              className="px-2 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: pendingColor }}
            >
              Badge
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: pendingColor }}
            >
              Selected Text
            </span>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={settingsModal.isOpen}
      onClose={settingsModal.onClose}
      onSubmit={handleSave}
      title="Settings"
      body={bodyContent}
      actionLabel="Save"
      secondaryAction={settingsModal.onClose}
      secondaryActionLabel="Cancel"
    />
  );
};

export default SettingsModal;
