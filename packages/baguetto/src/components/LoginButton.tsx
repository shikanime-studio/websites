import { BsGoogle } from "react-icons/bs";
import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";

export interface UseModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UseModalReturn {
  modalRef: React.RefObject<HTMLDialogElement | null>;
  isOpen: boolean;
  showModal: () => void;
  closeModal: () => void;
}

export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const { onOpen, onClose } = options;
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const showModal = useCallback(() => {
    if (modalRef.current && !isOpen) {
      modalRef.current.showModal();
      setIsOpen(true);
      onOpen?.();
    }
  }, [isOpen, onOpen]);

  const closeModal = useCallback(() => {
    modalRef.current?.close();
  }, []);

  // Listen for modal close events
  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      const handleClose = () => {
        setIsOpen(false);
        onClose?.();
      };

      modal.addEventListener("close", handleClose);
      return () => modal.removeEventListener("close", handleClose);
    }
  }, [onClose]);

  return {
    modalRef,
    isOpen,
    showModal,
    closeModal,
  };
}

interface LoginModalProps {
  onOpen?: () => void;
  onClose?: () => void;
}

export interface LoginModalRef {
  showModal: () => void;
  close: () => void;
}

const LoginModal = forwardRef<LoginModalRef, LoginModalProps>(
  ({ onOpen, onClose }, ref) => {
    const googleButtonRef = useRef<HTMLDivElement>(null);

    const { modalRef, showModal, closeModal } = useModal({
      onOpen,
      onClose,
    });

    useImperativeHandle(ref, () => ({
      showModal: () => {
        showModal();
        renderGoogleSignInButton();
      },
      close: closeModal,
    }));

    useEffect(() => {
      // Initialize Google Sign-In when component loads
      if (typeof window !== "undefined" && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id:
            "978776659802-nea5l2vthdjsuguclef373qcesoed4pf.apps.googleusercontent.com",
          login_uri: "http://localhost:4321/flow/google/callback",
          ux_mode: "redirect",
        });
        window.google.accounts.id.prompt(() => {});
      }
    }, []);

    const renderGoogleSignInButton = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        // Render the Google Sign-In button immediately
        const buttonContainer = googleButtonRef.current;
        if (buttonContainer && !buttonContainer.hasChildNodes()) {
          window.google.accounts.id.renderButton(buttonContainer, {
            type: "standard",
            size: "large",
            theme: "outline",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
        }
      }
    };

    return (
      <dialog ref={modalRef} className="modal">
        <div className="modal-box max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <h3 className="font-bold text-lg mb-6 text-center">
            Sign in to continue
          </h3>

          <div className="text-center">
            <div ref={googleButtonRef} className="mb-4 flex justify-center" />
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    );
  },
);

interface SignInButtonProps {
  isLoading?: boolean;
  onClick?: () => void;
}

function SignInButton({ isLoading = false, onClick }: SignInButtonProps) {
  return (
    <button className="btn btn-sm" onClick={onClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          SIGNING IN
        </>
      ) : (
        <>
          <BsGoogle />
          SIGN IN
        </>
      )}
    </button>
  );
}

export default function LoginButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<LoginModalRef>(null);

  const handleSignInClick = () => {
    setIsModalOpen(true);
    modalRef.current?.showModal();
  };

  return (
    <>
      <SignInButton isLoading={isModalOpen} onClick={handleSignInClick} />

      <LoginModal
        ref={modalRef}
        onOpen={() => setIsModalOpen(true)}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
