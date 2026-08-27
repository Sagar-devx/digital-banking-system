export function extractErrorMessage(err, defaultMessage = 'An unexpected error occurred. Please try again.') {
  if (!err) return defaultMessage;

  // 1. Backend Custom ErrorResponse with validationErrors map
  if (err.response?.data?.validationErrors && typeof err.response.data.validationErrors === 'object') {
    const errorList = Object.entries(err.response.data.validationErrors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(', ');
    if (errorList) return errorList;
  }

  // 2. Backend Custom ErrorResponse with message field
  if (err.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }

  // 3. Plain text error message from backend or gateway
  if (typeof err.response?.data === 'string' && err.response.data.trim().length > 0) {
    const trimmed = err.response.data.trim();
    // If it's not HTML error page
    if (!trimmed.startsWith('<') && !trimmed.startsWith('<!DOCTYPE')) {
      return trimmed;
    }
  }

  // 4. Backend error field (if message is missing)
  if (err.response?.data?.error && typeof err.response.data.error === 'string') {
    return err.response.data.error;
  }

  // 5. Check response status codes for standard messages if body is empty
  if (err.response?.status === 409) {
    return 'An account with this email or details already exists.';
  }
  if (err.response?.status === 404) {
    return 'The requested account or resource was not found.';
  }
  if (err.response?.status === 400) {
    return 'Invalid request details. Please check your inputs.';
  }
  if (err.response?.status === 429) {
    return 'Too many requests. Please slow down and try again.';
  }
  if (err.response?.status === 502 || err.response?.status === 503 || err.response?.status === 504) {
    return 'Service temporarily unavailable. Please make sure all microservices are running.';
  }

  // 6. Axios network error (e.g. connection refused / gateway down)
  if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
    return 'Unable to connect to the server. Please ensure the API Gateway (port 8080) and backend services are running.';
  }

  // 7. General error message
  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  return defaultMessage;
}
