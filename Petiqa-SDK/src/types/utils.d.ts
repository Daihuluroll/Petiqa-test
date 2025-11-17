// Ambient declarations to allow importing JS utils without TypeScript declaration files.
// These match common relative import patterns used in the SDK source.
declare module '../utils/*';
declare module '../../utils/*';
declare module './utils/*';

// Fallback for any JS module imports
declare module '*.js';
