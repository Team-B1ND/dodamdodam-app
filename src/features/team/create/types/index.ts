import { ImagePickerAsset } from "expo-image-picker"
import { StudentMember } from "@features/night-study"

export interface TeamImagePickerProps {
  value: ImagePickerAsset | null;
  onChange: (
    asset: ImagePickerAsset |null
  ) => void
}

export interface SelectedStudent {
  name: string
}

export interface TeamApplyFromProps {
  teamName: string
  setTeamName: (text: string) => void
  teamDescription: string
  setTeamDescription: (text: string) => void
  teamImage: ImagePickerAsset | null
  setTeamImage: (asset: ImagePickerAsset | null) => void
  TeamMembers: StudentMember[]
  setTeamMembers: (members: StudentMember[]) => void
}