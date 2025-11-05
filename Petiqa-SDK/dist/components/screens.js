import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePetiqa } from '../context/PetiqaContext';
export const HomeScreen = ({ navigation }) => {
    const { theme } = usePetiqa();
    return (_jsxs(View, { style: [styles.container, { backgroundColor: theme.background }], children: [_jsx(Text, { style: [styles.headerText, { color: theme.text }], children: "PeTiQa" }), _jsx(TouchableOpacity, { style: [styles.button, { backgroundColor: theme.button }], onPress: () => navigation.navigate('CreateName'), children: _jsx(Text, { style: [styles.buttonText, { color: theme.buttonText }], children: "Play" }) })] }));
};
export const CreateNameScreen = ({ navigation }) => {
    const [petName, setPetName] = useState('');
    const { theme } = usePetiqa();
    return (_jsxs(View, { style: [styles.container, { backgroundColor: theme.background }], children: [_jsx(Text, { style: [styles.headerText, { color: theme.text }], children: "Create Pet Name" }), _jsx(TouchableOpacity, { style: [styles.button, { backgroundColor: theme.button }], onPress: () => navigation.navigate('PetSelection', { petName }), children: _jsx(Text, { style: [styles.buttonText, { color: theme.buttonText }], children: "Continue" }) })] }));
};
export const PetSelectionScreen = ({ navigation, route }) => {
    const { petName } = route.params;
    const { theme } = usePetiqa();
    return (_jsxs(View, { style: [styles.container, { backgroundColor: theme.background }], children: [_jsx(Text, { style: [styles.headerText, { color: theme.text }], children: "Select Pet" }), _jsx(TouchableOpacity, { style: [styles.button, { backgroundColor: theme.button }], onPress: () => navigation.navigate('MainGame', { petName, character: 'Tiger' }), children: _jsx(Text, { style: [styles.buttonText, { color: theme.buttonText }], children: "Continue" }) })] }));
};
export const MainGameScreen = ({ route }) => {
    const { petName, character } = route.params;
    const { theme } = usePetiqa();
    return (_jsx(View, { style: [styles.container, { backgroundColor: theme.background }], children: _jsxs(Text, { style: [styles.headerText, { color: theme.text }], children: ["Welcome ", petName, " the ", character] }) }));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        marginBottom: 20,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 16,
    },
});
