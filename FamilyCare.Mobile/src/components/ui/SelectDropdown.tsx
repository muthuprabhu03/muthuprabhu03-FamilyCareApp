import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { SFSymbol } from 'expo-symbols';

export interface DropdownItem {
  id: string | number;
  label: string;
  subLabel?: string;
  icon?: SFSymbol | string;
  iconColor?: string;
}

interface SelectDropdownProps {
  label: string;
  placeholder?: string;
  items: DropdownItem[];
  selectedValue?: string | number | null;
  onSelect: (item: DropdownItem) => void;
  error?: string;
  required?: boolean;
}

export function SelectDropdown({
  label,
  placeholder = 'Select an option',
  items,
  selectedValue,
  onSelect,
  error,
  required = false,
}: SelectDropdownProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();

  const selectedItem = items.find((i) => String(i.id) === String(selectedValue));

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={styles.label}>
        {label} {required && <ThemedText style={{ color: '#ef4444' }}>*</ThemedText>}
      </ThemedText>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[
          styles.selector,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: error ? '#ef4444' : theme.backgroundSelected,
          },
        ]}
      >
        <View style={styles.selectedContent}>
          {selectedItem?.icon && (
            <View style={[styles.iconCircle, { backgroundColor: selectedItem.iconColor ? `${selectedItem.iconColor}20` : '#e0e7ff' }]}>
              <AppIcon
                name={selectedItem.icon}
                tintColor={selectedItem.iconColor || '#667eea'}
                size={18}
              />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <ThemedText
              style={[
                styles.selectedText,
                !selectedItem && { color: theme.textSecondary },
              ]}
              numberOfLines={1}
            >
              {selectedItem ? selectedItem.label : placeholder}
            </ThemedText>
            {selectedItem?.subLabel && (
              <ThemedText type="small" themeColor="textSecondary">
                {selectedItem.subLabel}
              </ThemedText>
            )}
          </View>
        </View>

        <AppIcon
          name="chevron.up.chevron.down"
          tintColor={theme.textSecondary}
          size={16}
        />
      </TouchableOpacity>

      {error ? (
        <ThemedText type="small" style={styles.errorText}>
          {error}
        </ThemedText>
      ) : null}

      {/* Picker Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ThemedView
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.background },
                ]}
              >
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>{label}</ThemedText>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <AppIcon
                      name="xmark.circle.fill"
                      tintColor={theme.textSecondary}
                      size={24}
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={items}
                  keyExtractor={(item) => String(item.id)}
                  style={{ maxHeight: 350 }}
                  ItemSeparatorComponent={() => (
                    <View
                      style={[
                        styles.separator,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    />
                  )}
                  renderItem={({ item }) => {
                    const isSelected = String(item.id) === String(selectedValue);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          isSelected && {
                            backgroundColor: `${theme.backgroundSelected}60`,
                          },
                        ]}
                        onPress={() => {
                          onSelect(item);
                          setModalVisible(false);
                        }}
                      >
                        {item.icon && (
                          <View
                            style={[
                              styles.iconCircle,
                              {
                                backgroundColor: item.iconColor
                                  ? `${item.iconColor}20`
                                  : '#e0e7ff',
                              },
                            ]}
                          >
                            <AppIcon
                              name={item.icon}
                              tintColor={item.iconColor || '#667eea'}
                              size={20}
                            />
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <ThemedText
                            style={[
                              styles.optionLabel,
                              isSelected && {
                                color: '#667eea',
                                fontWeight: 'bold',
                              },
                            ]}
                          >
                            {item.label}
                          </ThemedText>
                          {item.subLabel && (
                            <ThemedText
                              type="small"
                              themeColor="textSecondary"
                            >
                              {item.subLabel}
                            </ThemedText>
                          )}
                        </View>
                        {isSelected && (
                          <AppIcon
                            name="checkmark.circle.fill"
                            tintColor="#667eea"
                            size={20}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </ThemedView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.four,
  },
  label: {
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
  selectedText: {
    fontSize: 16,
    fontWeight: '500',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.three,
  },
  errorText: {
    color: '#ef4444',
    marginTop: Spacing.half,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  modalContent: {
    borderRadius: 20,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5e1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: Spacing.one,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: 8,
  },
  optionLabel: {
    fontSize: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
});
