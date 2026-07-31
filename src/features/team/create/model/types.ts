import type { ImagePickerAsset } from "expo-image-picker";
import type { StudentMember } from "@features/night-study";

export interface TeamImagePickerProps {
  value: ImagePickerAsset | null;
  onChange: (asset: ImagePickerAsset | null) => void;
}

export interface TeamApplyFormProps {
  teamName: string;
  onTeamNameChange: (text: string) => void;
  teamDescription: string;
  onTeamDescriptionChange: (text: string) => void;
  teamImage: ImagePickerAsset | null;
  onTeamImageChange: (asset: ImagePickerAsset | null) => void;
  teamMembers: StudentMember[];
  onAddMemberPress: () => void;
}
