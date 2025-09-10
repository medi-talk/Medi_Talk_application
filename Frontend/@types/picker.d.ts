declare module '@react-native-picker/picker' {
  import * as React from 'react';
  import { StyleProp, ViewStyle, TextStyle } from 'react-native';

  export interface PickerProps {
    selectedValue?: any;
    onValueChange?: (itemValue: any, itemIndex: number) => void;
    enabled?: boolean;
    mode?: 'dialog' | 'dropdown';
    style?: StyleProp<ViewStyle | TextStyle>;
    itemStyle?: StyleProp<TextStyle>;
    prompt?: string;
    dropdownIconColor?: string;
    numberOfLines?: number;
    testID?: string;
    children?: React.ReactNode;   // ✅ children 명시적으로 추가
  }

  export class Picker extends React.Component<PickerProps> {
    static Item: React.ComponentType<{ label: string; value: any }>;
  }
}
