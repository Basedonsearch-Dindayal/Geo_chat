import React from 'react';
import { DistanceRange } from '../types';

interface RangeSelectorProps {
  selectedRange: DistanceRange;
  onRangeChange: (range: DistanceRange) => void;
  userCount: number;
}

export const RangeSelector: React.FC<RangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  userCount
}) => {
  const ranges: DistanceRange[] = [1, 5, 10];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Chat Range</h3>
      <div className="flex space-x-2">
        {ranges.map((range) => (
          <button
            key={range}
            onClick={() => onRangeChange(range)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range}km
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {userCount} {userCount === 1 ? 'person' : 'people'} within {selectedRange}km
      </p>
    </div>
  );
};