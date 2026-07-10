import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from './AppText';
import { theme } from '../theme';

export interface CategoryChipProps {
  label: string;
  icon: string;
  active?: boolean;
  onPress?: () => void;
}

/** Chip de categoría (icono en cuadro redondeado + etiqueta). */
export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  icon,
  active = false,
  onPress,
}) => {
  return (
    <Pressable style={styles.container} onPress={onPress} accessibilityRole="button">
      <View style={[styles.iconBox, active && styles.iconBoxActive]}>
        <Icon
          name={icon}
          size={26}
          color={active ? theme.colors.onPrimaryContainer : theme.colors.onSurface}
        />
      </View>
      <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: theme.spacing.stackMd,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  label: {
    marginTop: theme.spacing.unit,
    fontSize: 11,
  },
});

export default CategoryChip;
