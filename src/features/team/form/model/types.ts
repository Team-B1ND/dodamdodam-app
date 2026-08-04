import type { ImagePickerAsset } from "expo-image-picker";
import type { StudentMember } from "@features/night-study";
import type { TeamMember } from "@entities/team";

export type TeamFormImage =
  | { type: "remote"; url: string }
  | { type: "local"; asset: ImagePickerAsset }
  | null;

export interface TeamImagePickerProps {
  value: TeamFormImage;
  onChange: (image: TeamFormImage) => void;
}

export interface TeamApplyFormProps {
  teamName: string;
  onTeamNameChange: (text: string) => void;
  teamDescription: string;
  onTeamDescriptionChange: (text: string) => void;
  teamImage: TeamFormImage;
  onTeamImageChange: (image: TeamFormImage) => void;
  existingMembers?: TeamMember[];
  teamMembers: StudentMember[];
  onAddMemberPress: () => void;
}
