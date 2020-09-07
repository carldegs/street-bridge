import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus,
  faCodeBranch,
  faFingerprint,
  faUserFriends,
  faPlay,
  faSpinner,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';

const setupFALibrary = (): void =>
  library.add(
    faPlus,
    faFingerprint,
    faUserFriends,
    faPlay,
    faSpinner,
    faCodeBranch,
    faEllipsisH
  );

export default setupFALibrary;
