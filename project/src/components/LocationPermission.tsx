import { AlertCircle, MapPin } from 'lucide-react';
import React from 'react';

interface LocationPermissionProps {
  onLocationGranted: (position: GeolocationPosition) => void;
  onLocationError: (error: string) => void; // This could be enhanced to pass a specific error object
  error: string | null;
}

export const LocationPermission: React.FC<LocationPermissionProps> = ({
  onLocationGranted,
  onLocationError,
  error
}) => {
  const requestLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000, // Increased timeout to 20 seconds
          maximumAge: 300000
        });
      });
      onLocationGranted(position);
    } catch (err) {
      console.error('Location error:', err);
      const geolocationError = err as GeolocationPositionError;
      let userFacingErrorMessage: string;

      switch (geolocationError.code) {
        case geolocationError.PERMISSION_DENIED:
          userFacingErrorMessage = 'Permission to access location was denied. Please enable it in your browser settings.';
          break;
        case geolocationError.POSITION_UNAVAILABLE:
          userFacingErrorMessage = 'Your location could not be determined. Please ensure location services are enabled and you have a good signal.';
          break;
        case geolocationError.TIMEOUT:
          userFacingErrorMessage = 'Attempt to get location timed out. Please try again or check your connection.';
          break;
        default:
          userFacingErrorMessage = 'An unknown error occurred while trying to get your location. Please try again.';
      }
      onLocationError(userFacingErrorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Location Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            We need your location to connect you with people nearby. Your location is only used to find others within your selected range.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex flex-col items-center text-red-700 dark:text-red-400">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm font-semibold">Location Error:</span>
            </div>
            <span className="text-sm text-center">{error}</span>
            {/* Fix: Changed <p> to <div> for valid HTML nesting */}
            <div className="text-xs text-red-600 dark:text-red-400 mt-2">
              Please check:
              <ul className="list-disc list-inside mt-1 text-left">
                <li>Your device's location services are enabled.</li>
                <li>You have granted permission to this site in your browser settings.</li>
                <li>You have a good Wi-Fi or cellular signal.</li>
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={requestLocation}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Enable Location
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Your exact location is never shared with other users. Only approximate distance is shown.
        </p>
      </div>
    </div>
  );
};