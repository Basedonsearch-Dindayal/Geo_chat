// Simple validation functions without external dependencies
export function validateJoinLocation(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.username || typeof data.username !== 'string') {
    errors.push('Username is required and must be a string');
  } else if (data.username.trim().length < 2 || data.username.trim().length > 20) {
    errors.push('Username must be between 2 and 20 characters');
  }

  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be a number between -90 and 90');
  }

  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be a number between -180 and 180');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateUpdateLocation(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be a number between -90 and 90');
  }

  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be a number between -180 and 180');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateSendMessage(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.content || typeof data.content !== 'string') {
    errors.push('Content is required and must be a string');
  } else if (data.content.trim().length === 0 || data.content.length > 500) {
    errors.push('Content must be between 1 and 500 characters');
  }

  if (typeof data.latitude !== 'number' || data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be a number between -90 and 90');
  }

  if (typeof data.longitude !== 'number' || data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be a number between -180 and 180');
  }

  if (data.recipientId !== undefined && typeof data.recipientId !== 'string') {
    errors.push('Recipient ID must be a string if provided');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateStartDirectChat(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.userId || typeof data.userId !== 'string') {
    errors.push('User ID is required and must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateDistanceRange(range: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof range !== 'number' || ![1, 5, 10].includes(range)) {
    errors.push('Distance range must be 1, 5, or 10');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
