// Ensure the original types are loaded
import '@react-navigation/native';

declare module '@react-navigation/native' {
  interface NavigationContainerProps {
    /**
     * Allows this NavigationContainer to run independently when
     * nested inside a host app NavigationContainer.
     */
    independent?: boolean;
  }
}
