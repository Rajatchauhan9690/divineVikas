import { useEffect } from "react";
import { getTodayDate } from "../utils/dateUtils";

/* Auto updates date when day changes */

const useAutoDateSync = (setDateState) => {
  useEffect(() => {
    const scheduleMidnightUpdate = () => {
      const now = new Date();

      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        5,
      );

      const delay = nextDay.getTime() - now.getTime();

      const timer = setTimeout(() => {
        setDateState(getTodayDate());
        scheduleMidnightUpdate();
      }, delay);

      return timer;
    };

    const timer = scheduleMidnightUpdate();

    return () => clearTimeout(timer);
  }, [setDateState]);
};

export default useAutoDateSync;
