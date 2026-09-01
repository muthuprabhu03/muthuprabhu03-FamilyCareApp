import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { AppIcon } from '@/components/ui/AppIcon';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface CustomDateTimePickerProps {
  labelDate?: string;
  labelTime?: string;
  selectedDateTime: Date;
  onDateTimeChange: (newDateTime: Date) => void;
  required?: boolean;
}

export function CustomDateTimePicker({
  labelDate = 'Date',
  labelTime = 'Time',
  selectedDateTime,
  onDateTimeChange,
  required = true,
}: CustomDateTimePickerProps) {
  const theme = useTheme();
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);

  // Generate next 30 days for selection
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  // Hours 0..23 (or 1..12 AM/PM)
  const hours = [
    { label: '06:00 AM (Early Morning)', hour: 6, min: 0 },
    { label: '07:00 AM (Morning)', hour: 7, min: 0 },
    { label: '08:00 AM (Breakfast)', hour: 8, min: 0 },
    { label: '09:00 AM (Work Start)', hour: 9, min: 0 },
    { label: '10:00 AM', hour: 10, min: 0 },
    { label: '11:00 AM', hour: 11, min: 0 },
    { label: '12:00 PM (Noon)', hour: 12, min: 0 },
    { label: '01:00 PM (Lunch)', hour: 13, min: 0 },
    { label: '02:00 PM', hour: 14, min: 0 },
    { label: '03:00 PM', hour: 15, min: 0 },
    { label: '04:00 PM (Tea/Snack)', hour: 16, min: 0 },
    { label: '05:00 PM', hour: 17, min: 0 },
    { label: '06:00 PM (Evening)', hour: 18, min: 0 },
    { label: '07:00 PM', hour: 19, min: 0 },
    { label: '08:00 PM (Dinner)', hour: 20, min: 0 },
    { label: '09:00 PM (Night)', hour: 21, min: 0 },
    { label: '10:00 PM (Bedtime)', hour: 22, min: 0 },
    { label: '11:00 PM', hour: 23, min: 0 },
  ];

  const handleSelectDate = (date: Date) => {
    const newDate = new Date(selectedDateTime);
    newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    onDateTimeChange(newDate);
    setDateModalVisible(false);
  };

  const handleSelectTime = (hour: number, min: number) => {
    const newDate = new Date(selectedDateTime);
    newDate.setHours(hour, min, 0, 0);
    onDateTimeChange(newDate);
    setTimeModalVisible(false);
  };

  const formattedDate = selectedDateTime.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = selectedDateTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Date Selector Box */}
        <View style={styles.column}>
          <ThemedText type="small" style={styles.label}>
            {labelDate} {required && <ThemedText style={{ color: '#ef4444' }}>*</ThemedText>}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.pickerBtn,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected,
              },
            ]}
            onPress={() => setDateModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <AppIcon name="calendar" tintColor="#667eea" size={18} />
            </View>
            <ThemedText style={styles.pickerText} numberOfLines={1}>
              {formattedDate}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Time Selector Box */}
        <View style={styles.column}>
          <ThemedText type="small" style={styles.label}>
            {labelTime} {required && <ThemedText style={{ color: '#ef4444' }}>*</ThemedText>}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.pickerBtn,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected,
              },
            ]}
            onPress={() => setTimeModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <AppIcon name="clock" tintColor="#10b981" size={18} />
            </View>
            <ThemedText style={styles.pickerText} numberOfLines={1}>
              {formattedTime}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal
        visible={dateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDateModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ThemedView
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.background },
                ]}
              >
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Select Date</ThemedText>
                  <TouchableOpacity
                    onPress={() => setDateModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <AppIcon name="xmark.circle.fill" tintColor={theme.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 360 }}>
                  {days.map((d, index) => {
                    const isSelected =
                      d.getDate() === selectedDateTime.getDate() &&
                      d.getMonth() === selectedDateTime.getMonth() &&
                      d.getFullYear() === selectedDateTime.getFullYear();

                    const isToday = d.toDateString() === new Date().toDateString();
                    const isTomorrow =
                      d.getDate() === new Date().getDate() + 1 &&
                      d.getMonth() === new Date().getMonth();

                    let tag = '';
                    if (isToday) tag = ' (Today)';
                    else if (isTomorrow) tag = ' (Tomorrow)';

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionItem,
                          isSelected && { backgroundColor: `${theme.backgroundSelected}60` },
                        ]}
                        onPress={() => handleSelectDate(d)}
                      >
                        <AppIcon
                          name="calendar"
                          tintColor={isSelected ? '#667eea' : theme.textSecondary}
                          size={18}
                        />
                        <ThemedText
                          style={[
                            styles.optionLabel,
                            isSelected && { color: '#667eea', fontWeight: 'bold' },
                          ]}
                        >
                          {d.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {tag}
                        </ThemedText>
                        {isSelected && (
                          <AppIcon name="checkmark.circle.fill" tintColor="#667eea" size={20} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </ThemedView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={timeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTimeModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTimeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <ThemedView
                style={[
                  styles.modalContent,
                  { backgroundColor: theme.background },
                ]}
              >
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Select Specific Time</ThemedText>
                  <TouchableOpacity
                    onPress={() => setTimeModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <AppIcon name="xmark.circle.fill" tintColor={theme.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 360 }}>
                  {hours.map((h, index) => {
                    const isSelected = selectedDateTime.getHours() === h.hour;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionItem,
                          isSelected && { backgroundColor: `${theme.backgroundSelected}60` },
                        ]}
                        onPress={() => handleSelectTime(h.hour, h.min)}
                      >
                        <AppIcon
                          name="clock"
                          tintColor={isSelected ? '#10b981' : theme.textSecondary}
                          size={18}
                        />
                        <ThemedText
                          style={[
                            styles.optionLabel,
                            isSelected && { color: '#10b981', fontWeight: 'bold' },
                          ]}
                        >
                          {h.label}
                        </ThemedText>
                        {isSelected && (
                          <AppIcon name="checkmark.circle.fill" tintColor="#10b981" size={20} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    marginBottom: Spacing.one,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
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
    gap: 12,
  },
  optionLabel: {
    fontSize: 15,
    flex: 1,
  },
});
