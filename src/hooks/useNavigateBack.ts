import { useNavigate } from "react-router-dom";

export const useNavigateBack = (fallbackPath: string = "/") => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return handleBack;
};

