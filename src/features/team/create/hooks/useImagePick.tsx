import * as ImagePicker from "expo-image-picker"
import { useCallback } from "react"

export const useImagePick = (onChange: (assets: ImagePicker.ImagePickerAsset) => void) => {
  return useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (!result.canceled && result.assets[0]) {
          onChange(result.assets[0]);
        }

    
  }, [onChange])

}