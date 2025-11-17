// Local SDK config — keeps SDK self-contained for builds/tests.
// You can override this at runtime by passing a different base URL to the SDK entrypoints.
// Note: This should be your backend API server URL, NOT the MongoDB connection string.
// MongoDB connection is internal to your backend server.
export const baseUrl = 'http://localhost:3000/';
