import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BasicModal from "../components/common/BasicModal";
import { PATHS } from "../routes/path";
import {
  bindLoginRequiredModalHandler,
  unbindLoginRequiredModalHandler,
} from "./loginRequiredModalBridge";

export function LoginRequiredModalProvider() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    bindLoginRequiredModalHandler(() => setOpen(true));
    return () => {
      unbindLoginRequiredModalHandler();
    };
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleGoLogin = () => {
    setOpen(false);
    navigate(PATHS.LOGIN);
  };

  return (
    <BasicModal
      open={open}
      title="로그인이 필요한 기능입니다."
      description={"로그인 후 사용할 수 있어요."}
      primaryLabel="로그인"
      onPrimary={handleGoLogin}
      onClose={handleClose}
    />
  );
}
