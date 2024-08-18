import { User } from "@core/modules/user/User.types";

import "@components/design/LoadingIndicator";
import "@components/design/ErrorView";

export type UserContext = {
  user: User | null;
  refresh: () => void;
};
