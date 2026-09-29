import type { NativeStackScreenProps } from "@react-navigation/native-stack"

import { RoleHome } from "../components/RoleHome"
import type { RootStackParamList } from "../navigation/types"

type Props = NativeStackScreenProps<RootStackParamList, "ResidentHome">

export function ResidentHomeScreen({ navigation }: Props) {
  return <RoleHome kind="resident" onPrimaryAction={() => navigation.navigate("CreateIdea")} />
}
