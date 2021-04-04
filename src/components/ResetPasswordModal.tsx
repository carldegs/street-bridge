import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Stack,
  ModalProps,
} from '@chakra-ui/react';
import React from 'react';

import { Abort } from '../types/Abort';

import InputField from './InputField';

// TODO: Add state and validation
// TODO: Add submit

const ResetPasswordModal: React.FC<Abort<ModalProps>> = ({
  isOpen,
  onClose,
}: Abort<ModalProps>) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Reset Password</ModalHeader>
        <ModalCloseButton />
        <ModalBody mt={4}>
          <Stack spacing={6}>
            <InputField name="password" type="password" label="Password" />
            <InputField
              name="newPassword"
              type="password"
              label="New Password"
            />
            <InputField
              name="confirmNewPassword"
              type="password"
              label="Confirm New Password"
            />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="cyan">Reset Password</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

//       <ModalProps, show={showResetPWModal} onHide={() => setShowResetPWModal(false)}>
//         <Modal.Header closeButton>Reset Password</Modal.Header>
//         <Modal.Body>
//           <Form.Group controlId="password">
//             <Form.Label style={{ color: '#E9EBF9' }}>Password</Form.Label>
//             <Form.Control
//               value={password}
//               onChange={e => {
//                 setPassword(e.target.value);
//               }}
//               onBlur={() => {
//                 setAllowResetPassword(!!password && password.length >= 8);
//               }}
//               type="password"
//             />
//             {passwordError && <Alert variant="danger">{passwordError}</Alert>}
//           </Form.Group>
//           <Form.Group controlId="newPassword">
//             <Form.Label style={{ color: '#E9EBF9' }}>New Password</Form.Label>
//             <Form.Control
//               value={newPassword}
//               onChange={e => {
//                 setNewPassword(e.target.value);
//               }}
//               onBlur={() => {
//                 setAllowResetPassword(!!newPassword && newPassword.length >= 8);
//               }}
//               type="password"
//             />
//           </Form.Group>
//           {passwordError && <Alert variant="danger">{passwordError}</Alert>}
//         </Modal.Body>
//         <Modal.Footer>
//           <SBButton
//             outline
//             color="green"
//             disabled={!allowResetPassword || !auth.state.authUser?.email}
//             onClick={async () => {
//               setAllowResetPassword(false);
//               if (auth.state.authUser?.email) {
//                 firebase
//                   .updatePassword(
//                     auth.state.authUser.email,
//                     password,
//                     newPassword
//                   )
//                   .then(() => setShowResetPWModal(false))
//                   .catch((err: any) => {
//                     setPasswordError(err.message);
//                     setAllowResetPassword(true);
//                   });
//               }
//             }}
//           >
//             UPDATE PASSWORD
//           </SBButton>
//         </Modal.Footer>
//       </ModalProps,>

export default ResetPasswordModal;
