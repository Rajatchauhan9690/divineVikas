import { useEffect, useRef } from "react";
import { getTodayDate } from "../utils/dateUtils";

/* Auto updates date when day changes */

const useAutoDateSync = (setDateState) => {
  const timerRef = useRef(null);

  useEffect(() => {
    const scheduleUpdate = () => {
      const now = new Date();

      const nextDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        5,
      );

      return nextDay.getTime() - now.getTime();
    };

    const startTimer = () => {
      const delay = scheduleUpdate();

      timerRef.current = setTimeout(() => {
        setDateState(getTodayDate());
        startTimer(); // schedule next update safely
      }, delay);
    };

    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
};

export default useAutoDateSync;
