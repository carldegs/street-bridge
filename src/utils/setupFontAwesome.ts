import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus,
  faFingerprint,
  faUserFriends,
  faPlay,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const setupFALibrary = (): void =>
  library.add(faPlus, faFingerprint, faUserFriends, faPlay, faSpinner);

export default setupFALibrary;
